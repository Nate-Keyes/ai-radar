export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { type DigestItem } from '@/lib/email'

// Re-implement buildDigestHtml here so we can call it without sending
// (the function isn't exported from lib/email.ts)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ai-radar.vercel.app'

const CATEGORY_COLORS: Record<string, string> = {
  launch: '#10b981',
  news: '#3b82f6',
  update: '#f59e0b',
  research: '#8b5cf6',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function buildPreviewHtml(items: DigestItem[], digestDay: 'friday' | 'monday'): string {
  const greeting = digestDay === 'friday' ? 'Happy Friday' : 'Good Monday'
  const grouped: Record<string, DigestItem[]> = { launch: [], news: [], update: [], research: [] }
  for (const item of items) {
    if (grouped[item.category]) grouped[item.category].push(item)
  }

  const sections = Object.entries(grouped)
    .filter(([, list]) => list.length > 0)
    .map(([category, list]) => {
      const color = CATEGORY_COLORS[category] ?? '#6b7280'
      const label = category.charAt(0).toUpperCase() + category.slice(1) + 's'
      const itemRows = list.map((item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <a href="${item.url}" style="font-size:14px; font-weight:600; color:#111827; text-decoration:none; line-height:1.4;">
              ${item.title}
            </a>
            ${item.summary ? `<p style="margin:4px 0 0; font-size:13px; color:#6b7280; line-height:1.5;">${item.summary}</p>` : ''}
            <p style="margin:4px 0 0; font-size:12px; color:#9ca3af;">${item.source} · ${formatDate(item.published_at)}</p>
          </td>
        </tr>`).join('')

      return `
        <tr><td style="padding: 24px 0 4px;">
          <span style="display:inline-block; background:${color}20; color:${color}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; padding:3px 8px; border-radius:4px;">${label}</span>
        </td></tr>
        ${itemRows}`
    }).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#f9fafb; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">
        <tr><td style="background:#111827; padding:24px 32px;">
          <p style="margin:0; font-size:18px; font-weight:700; color:#ffffff; letter-spacing:-0.02em;">AI Radar</p>
          <p style="margin:4px 0 0; font-size:13px; color:#9ca3af;">${greeting} — your weekly AI digest</p>
        </td></tr>
        <tr><td style="padding:8px 32px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">${sections}</table>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <a href="${APP_URL}" style="display:inline-block; background:#111827; color:#ffffff; font-size:13px; font-weight:600; text-decoration:none; padding:10px 20px; border-radius:8px;">
            View full feed →
          </a>
        </td></tr>
        <tr><td style="background:#f9fafb; padding:16px 32px; border-top:1px solid #e5e7eb;">
          <p style="margin:0; font-size:12px; color:#9ca3af;">
            Preview mode — <a href="${APP_URL}" style="color:#6b7280;">${APP_URL}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function GET(req: NextRequest) {
  const day = (req.nextUrl.searchParams.get('day') ?? 'friday') as 'friday' | 'monday'

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: items, error } = await supabaseAdmin
    .from('items')
    .select('id, title, url, summary, category, source, published_at')
    .eq('approved', true)
    .gte('published_at', since)
    .order('published_at', { ascending: false })
    .limit(30)

  if (error) {
    return new Response(`Error: ${error.message}`, { status: 500 })
  }

  if (!items || items.length === 0) {
    return new Response('<p>No items in the last 7 days.</p>', {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const html = buildPreviewHtml(items as DigestItem[], day)
  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}
