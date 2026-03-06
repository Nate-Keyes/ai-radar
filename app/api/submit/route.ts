export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body || typeof body.title !== 'string' || typeof body.url !== 'string') {
    return Response.json({ error: 'title and url are required' }, { status: 400 })
  }

  const title = body.title.trim()
  const url = body.url.trim()
  const description = typeof body.description === 'string' ? body.description.trim() : null
  const submitter_email =
    typeof body.submitter_email === 'string' ? body.submitter_email.trim().toLowerCase() : null

  if (!title || title.length > 200) {
    return Response.json({ error: 'Title must be between 1 and 200 characters' }, { status: 400 })
  }

  // Basic URL validation
  try {
    new URL(url)
  } catch {
    return Response.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (submitter_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitter_email)) {
    return Response.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Check for duplicate URL already in submissions or live items
  const [{ data: existingSubmission }, { data: existingItem }] = await Promise.all([
    supabaseAdmin.from('submissions').select('id').eq('url', url).maybeSingle(),
    supabaseAdmin.from('items').select('id').eq('url', url).maybeSingle(),
  ])

  if (existingSubmission || existingItem) {
    return Response.json({ error: 'This URL has already been submitted' }, { status: 409 })
  }

  const { error } = await supabaseAdmin.from('submissions').insert({
    title,
    url,
    description: description || null,
    submitter_email: submitter_email || null,
    status: 'pending',
  })

  if (error) {
    console.error('[submit] Supabase error:', error.message)
    return Response.json({ error: 'Failed to submit. Please try again.' }, { status: 500 })
  }

  return Response.json({ success: true }, { status: 201 })
}
