export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { summarizeItem } from '@/lib/summarize'
import type { Category } from '@/lib/sources'

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = req.nextUrl.searchParams.get('status') ?? 'pending'
  const validStatuses = ['pending', 'approved', 'rejected']
  if (!validStatuses.includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('submissions')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ submissions: data ?? [] })
}

export async function POST(req: NextRequest) {
  // Password-protect via header
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body.id !== 'string' || !['approve', 'reject'].includes(body.action)) {
    return Response.json({ error: 'id and action (approve|reject) are required' }, { status: 400 })
  }

  const { id, action } = body as { id: string; action: 'approve' | 'reject' }

  // Fetch the submission
  const { data: submission, error: fetchError } = await supabaseAdmin
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !submission) {
    return Response.json({ error: 'Submission not found' }, { status: 404 })
  }

  if (submission.status !== 'pending') {
    return Response.json({ error: 'Submission already actioned' }, { status: 409 })
  }

  if (action === 'reject') {
    const { error } = await supabaseAdmin
      .from('submissions')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true, action: 'rejected' })
  }

  // Approve: summarize + insert into items
  const { summary, category } = await summarizeItem(
    submission.title,
    submission.description ?? '',
    'news' as Category
  )

  const { error: insertError } = await supabaseAdmin.from('items').insert({
    title: submission.title,
    url: submission.url,
    summary,
    category,
    source: 'Community',
    published_at: new Date().toISOString(),
    approved: true,
  })

  if (insertError) {
    // URL might already exist
    if (insertError.code === '23505') {
      await supabaseAdmin.from('submissions').update({ status: 'approved' }).eq('id', id)
      return Response.json({ success: true, action: 'approved', note: 'URL already in feed' })
    }
    return Response.json({ error: insertError.message }, { status: 500 })
  }

  await supabaseAdmin.from('submissions').update({ status: 'approved' }).eq('id', id)
  return Response.json({ success: true, action: 'approved' })
}
