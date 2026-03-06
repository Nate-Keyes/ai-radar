import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body || typeof body.email !== 'string') {
    return Response.json({ error: 'Missing email' }, { status: 400 })
  }

  const email = body.email.trim().toLowerCase()

  const { error } = await supabaseAdmin
    .from('subscribers')
    .delete()
    .eq('email', email)

  if (error) {
    console.error('[unsubscribe] Supabase error:', error.message)
    return Response.json({ error: 'Failed to unsubscribe. Please try again.' }, { status: 500 })
  }

  return Response.json({ success: true })
}
