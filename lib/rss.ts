import Parser from 'rss-parser'
import { RSS_SOURCES, type Source } from './sources'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'AI-Radar/1.0 (RSS aggregator)',
  },
})

export interface FeedItem {
  title: string
  url: string
  source: string
  category: Source['category']
  publishedAt: Date
  rawContent?: string
}

export async function fetchFeed(source: Source): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(source.url)
    return feed.items
      .filter((item) => item.title && item.link)
      .map((item) => ({
        title: item.title!.trim(),
        url: item.link!,
        source: source.name,
        category: source.category,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        rawContent: item.contentSnippet ?? item.summary ?? item.content ?? '',
      }))
  } catch (err) {
    console.error(`[rss] Failed to fetch ${source.name}:`, err)
    return []
  }
}

export async function fetchAllFeeds(): Promise<FeedItem[]> {
  const results = await Promise.allSettled(
    RSS_SOURCES.filter((s) => s).map((source) => fetchFeed(source))
  )

  const items: FeedItem[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      items.push(...result.value)
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}
