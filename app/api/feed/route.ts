import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

const PAGE_SIZE = 20

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') // null = all
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? String(PAGE_SIZE), 10))
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('items')
    .select('id, title, url, summary, category, source, published_at', { count: 'exact' })
    .eq('approved', true)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error, count } = await query

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({
    items: data ?? [],
    total: count ?? 0,
    page,
    limit,
    hasMore: (count ?? 0) > to + 1,
  })
}
