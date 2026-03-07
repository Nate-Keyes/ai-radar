import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ai-radar.vercel.app'
const FROM = 'AI Radar <onboarding@resend.dev>'

export interface DigestItem {
  id: string
  title: string
  url: string
  summary: string | null
  category: string
  topic: string | null
  source: string
  published_at: string
}

const TOPIC_ORDER = ['design tools', 'models & ai', 'product', 'research', 'industry']

const TOPIC_LABELS: Record<string, string> = {
  'design tools': 'Design Tools',
  'models & ai': 'Models & AI',
  'product': 'Product',
  'research': 'Research',
  'industry': 'Industry',
  'uncategorized': 'Uncategorized',
}

const MAX_ITEMS = 15

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function buildDigestHtml(items: DigestItem[], digestDay: 'friday' | 'monday'): string {
  const greeting = digestDay === 'friday' ? 'Happy Friday' : 'Good Monday'

  // Group by topic, normalizing to lowercase
  const grouped: Record<string, DigestItem[]> = {}
  for (const item of items.slice(0, MAX_ITEMS)) {
    const key = (item.topic ?? '').toLowerCase() || 'uncategorized'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(item)
  }

  const orderedKeys = [
    ...TOPIC_ORDER.filter((k) => grouped[k]),
    ...Object.keys(grouped).filter((k) => !TOPIC_ORDER.includes(k) && grouped[k]),
  ]

  const sections = orderedKeys
    .map((key) => {
      const list = grouped[key]
      const label = TOPIC_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1)

      const itemRows = list
        .map(
          (item) => `
          <tr>
            <td style="padding:14px 0; border-bottom:1px solid #f3f4f6;">
              <a href="${item.url}" style="font-size:14px; font-weight:600; color:#111827; text-decoration:none; line-height:1.4;">${item.title}</a>
              ${item.summary ? `<p style="margin:5px 0 0; font-size:13px; color:#6b7280; line-height:1.55;">${item.summary}</p>` : ''}
              <p style="margin:5px 0 0; font-size:12px; color:#9ca3af;">${item.source} · ${formatDate(item.published_at)}</p>
            </td>
          </tr>`
        )
        .join('')

      return `
        <tr>
          <td style="padding:28px 0 0;">
            <p style="margin:0 0 8px; font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:0.1em;">${label}</p>
            <div style="border-top:1px solid #e5e7eb;"></div>
          </td>
        </tr>
        ${itemRows}`
    })
    .join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#f9fafb; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px; border-bottom:1px solid #f3f4f6;">
              <p style="margin:0; font-size:20px; font-weight:700; color:#111827; letter-spacing:-0.02em;">AI Radar</p>
              <p style="margin:6px 0 0; font-size:14px; color:#6b7280;">${greeting} — your weekly digest</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${sections}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 32px 28px;">
              <a href="${APP_URL}" style="display:inline-block; background:#111827; color:#ffffff; font-size:13px; font-weight:600; text-decoration:none; padding:10px 20px; border-radius:8px;">
                View full feed →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding:16px 32px; border-top:1px solid #e5e7eb;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                <a href="${APP_URL}/unsubscribe?email={{email}}" style="color:#9ca3af;">Unsubscribe</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}" style="color:#9ca3af;">${APP_URL.replace('https://', '')}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendDigest(
  email: string,
  items: DigestItem[],
  digestDay: 'friday' | 'monday'
): Promise<boolean> {
  const subject =
    digestDay === 'friday'
      ? `AI Radar — Your Friday Digest (${items.length} stories)`
      : `AI Radar — Your Monday Briefing (${items.length} stories)`

  const html = buildDigestHtml(items, digestDay).replace('{{email}}', encodeURIComponent(email))

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject,
      html,
    })

    if (error) {
      console.error(`[email] Failed to send to ${email}:`, error)
      return false
    }
    return true
  } catch (err) {
    console.error(`[email] Exception sending to ${email}:`, err)
    return false
  }
}
