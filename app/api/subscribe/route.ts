export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body || typeof body.email !== 'string' || typeof body.digest_day !== 'string') {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const email = body.email.trim().toLowerCase()
  const digest_day = body.digest_day

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (!['friday', 'monday'].includes(digest_day)) {
    return Response.json({ error: 'digest_day must be friday or monday' }, { status: 400 })
  }

  // Upsert — if already subscribed, update their digest_day preference
  const { error } = await supabaseAdmin
    .from('subscribers')
    .upsert(
      { email, digest_day, confirmed: false },
      { onConflict: 'email', ignoreDuplicates: false }
    )

  if (error) {
    console.error('[subscribe] Supabase error:', error.message)
    return Response.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
  }

  return Response.json({ success: true })
}
