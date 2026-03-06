import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendDigest, type DigestItem } from '@/lib/email'

export const maxDuration = 300

// Vercel cron calls this on both schedules:
//   Friday 2pm UTC  → 0 14 * * 5
//   Monday 8am UTC  → 0 8 * * 1
// The route figures out which day it is and sends only to matching subscribers.

function getCurrentDigestDay(): 'friday' | 'monday' | null {
  const day = new Date().getUTCDay() // 0=Sun, 1=Mon, 5=Fri
  if (day === 5) return 'friday'
  if (day === 1) return 'monday'
  return null
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Allow override via query param for manual testing
  const forceDay = req.nextUrl.searchParams.get('day') as 'friday' | 'monday' | null
  const digestDay = forceDay ?? getCurrentDigestDay()

  if (!digestDay) {
    return Response.json({ message: 'Not a digest day, skipping.' })
  }

  console.log(`[digest] Sending ${digestDay} digest...`)

  // 1. Get items from the last 7 days
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('items')
    .select('id, title, url, summary, category, source, published_at')
    .eq('approved', true)
    .gte('published_at', since)
    .order('published_at', { ascending: false })
    .limit(30)

  if (itemsError) {
    console.error('[digest] Failed to fetch items:', itemsError.message)
    return Response.json({ error: 'Failed to fetch items' }, { status: 500 })
  }

  if (!items || items.length === 0) {
    return Response.json({ message: 'No items to send in digest', sent: 0 })
  }

  // 2. Get confirmed subscribers for this digest day
  const { data: subscribers, error: subError } = await supabaseAdmin
    .from('subscribers')
    .select('email')
    .eq('digest_day', digestDay)
    .eq('confirmed', true)

  if (subError) {
    console.error('[digest] Failed to fetch subscribers:', subError.message)
    return Response.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }

  if (!subscribers || subscribers.length === 0) {
    return Response.json({ message: 'No confirmed subscribers for this day', sent: 0 })
  }

  console.log(`[digest] Sending to ${subscribers.length} subscribers, ${items.length} items`)

  // 3. Send emails — batch to avoid hammering Resend rate limits
  const BATCH_SIZE = 10
  let sent = 0
  let failed = 0

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map((sub) => sendDigest(sub.email, items as DigestItem[], digestDay))
    )

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        sent++
      } else {
        failed++
      }
    }
  }

  console.log(`[digest] Done. Sent: ${sent}, Failed: ${failed}`)

  return Response.json({
    message: 'Digest sent',
    digestDay,
    itemCount: items.length,
    sent,
    failed,
  })
}
