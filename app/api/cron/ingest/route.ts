export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { fetchAllFeeds } from '@/lib/rss'
import { summarizeItem } from '@/lib/summarize'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 300 // 5 min — Vercel Pro/hobby max for cron

export async function GET(req: NextRequest) {
  // Protect route — only callable by Vercel cron or authorized requests
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  console.log('[ingest] Starting RSS ingest...')

  // 1. Fetch all feeds
  const feedItems = await fetchAllFeeds()
  console.log(`[ingest] Fetched ${feedItems.length} total items across all feeds`)

  if (feedItems.length === 0) {
    return Response.json({ message: 'No items fetched', inserted: 0 })
  }

  // 2. Get all existing URLs to deduplicate against the DB
  const { data: existingRows } = await supabaseAdmin
    .from('items')
    .select('url')

  const existingUrls = new Set((existingRows ?? []).map((r: { url: string }) => r.url))

  const newItems = feedItems.filter((item) => !existingUrls.has(item.url))
  console.log(`[ingest] ${newItems.length} new items after deduplication`)

  if (newItems.length === 0) {
    return Response.json({ message: 'No new items', inserted: 0 })
  }

  // 3. Summarize new items with Claude (batched to avoid rate limits)
  const BATCH_SIZE = 5
  let inserted = 0
  let failed = 0

  for (let i = 0; i < newItems.length; i += BATCH_SIZE) {
    const batch = newItems.slice(i, i + BATCH_SIZE)

    const summarized = await Promise.allSettled(
      batch.map(async (item) => {
        const { summary, category, topic } = await summarizeItem(
          item.title,
          item.rawContent ?? '',
          item.category,
          item.topic
        )
        return {
          title: item.title,
          url: item.url,
          summary,
          category,
          topic,
          source: item.source,
          published_at: item.publishedAt.toISOString(),
          approved: true,
        }
      })
    )

    const rows = summarized
      .filter((r) => r.status === 'fulfilled')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r) => (r as any).value as {
        title: string
        url: string
        summary: string
        category: string
        topic: string
        source: string
        published_at: string
        approved: boolean
      })

    failed += summarized.filter((r) => r.status === 'rejected').length

    if (rows.length > 0) {
      const { error } = await supabaseAdmin
        .from('items')
        .upsert(rows, { onConflict: 'url', ignoreDuplicates: true })

      if (error) {
        console.error('[ingest] Supabase insert error:', error.message)
      } else {
        inserted += rows.length
      }
    }
  }

  const duration = ((Date.now() - startedAt) / 1000).toFixed(1)
  console.log(`[ingest] Done. Inserted: ${inserted}, Failed: ${failed}, Duration: ${duration}s`)

  return Response.json({
    message: 'Ingest complete',
    fetched: feedItems.length,
    new: newItems.length,
    inserted,
    failed,
    duration: `${duration}s`,
  })
}
