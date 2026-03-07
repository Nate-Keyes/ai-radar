export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { buildDigestHtml, type DigestItem } from '@/lib/email'

export async function GET(req: NextRequest) {
  const day = (req.nextUrl.searchParams.get('day') ?? 'friday') as 'friday' | 'monday'

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: items, error } = await supabaseAdmin
    .from('items')
    .select('id, title, url, summary, category, topic, source, published_at')
    .eq('approved', true)
    .gte('published_at', since)
    .order('published_at', { ascending: false })
    .limit(50)

  if (error) {
    return new Response(`Error: ${error.message}`, { status: 500 })
  }

  if (!items || items.length === 0) {
    return new Response('<p>No items in the last 7 days.</p>', {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const html = buildDigestHtml(items as DigestItem[], day)
  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}
