export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return Response.json({ error: 'Missing url param' }, { status: 400 })
  }

  // Only allow http/https URLs
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return Response.json({ error: 'Invalid URL' }, { status: 400 })
    }
  } catch {
    return Response.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Radar/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return Response.json({ error: `Fetch failed: ${res.status}` }, { status: 502 })
    }

    const html = await res.text()
    const dom = new JSDOM(html, { url })
    const reader = new Readability(dom.window.document)
    const article = reader.parse()

    if (!article) {
      return Response.json({ error: 'Could not parse article' }, { status: 422 })
    }

    return Response.json({
      title: article.title,
      byline: article.byline,
      content: article.content,
      excerpt: article.excerpt,
    })
  } catch (err) {
    console.error('[reader] Error:', err)
    return Response.json({ error: 'Failed to fetch article' }, { status: 502 })
  }
}
