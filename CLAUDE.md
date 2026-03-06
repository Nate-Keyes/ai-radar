# AI Radar — Project Context

## What it is
AI tools news aggregator. Users see a live feed of AI launches, news, and research. They can subscribe for a weekly digest email (Friday 2pm or Monday 8am UTC). Anyone can submit community items which go through a moderation queue. Every 6 hours a cron job ingests RSS feeds, deduplicates, summarizes with Claude, and inserts into the database.

## Stack
- **Next.js 15** (App Router) + TypeScript
- **Supabase** — database + auth (service role for API routes, anon key for client)
- **Vercel** — hosting + cron jobs (vercel.json defines schedules)
- **Resend** — transactional email (digest + confirmation)
- **Anthropic Claude API** — summarization + category tagging (claude-haiku-4-5-20251001)
- **shadcn/ui** + Tailwind CSS v4 — all frontend UI

## Node / Package manager
- Node: 20.20.1 (set via `.nvmrc`)
- Package manager: npm
- Always run `nvm use 20.20.1` before npm commands

## Environment Variables
See `.env.local.example`. Required vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `CRON_SECRET` — bearer token to protect cron routes
- `ADMIN_PASSWORD` — protects the moderation dashboard
- `NEXT_PUBLIC_APP_URL` — full URL (e.g. https://ai-radar.vercel.app)

## Database Tables (Supabase)
| Table | Key Fields |
|---|---|
| `items` | id, title, url, summary, category, source, published_at, approved |
| `subscribers` | id, email, digest_day ('friday'\|'monday'), confirmed |
| `submissions` | id, title, url, description, submitter_email, status ('pending'\|'approved'\|'rejected') |
| `sources` | id, name, url, category, active |

Schema lives in `supabase/schema.sql`. RLS is enabled; public can only read approved items. API routes use service role (bypasses RLS).

## File Structure
```
app/
  page.tsx                    ← Homepage / live feed
  layout.tsx                  ← Root layout
  submit/page.tsx             ← Community submission form
  unsubscribe/page.tsx        ← Unsubscribe handler
  api/
    feed/route.ts             ← GET paginated feed items
    subscribe/route.ts        ← POST email signup + digest_day
    submit/route.ts           ← POST community submission
    moderate/route.ts         ← POST approve/reject (admin only)
    cron/
      ingest/route.ts         ← RSS fetch + Claude summarization (every 6h)
      digest/route.ts         ← Weekly email send (Fri 2pm + Mon 8am UTC)

components/
  Feed.tsx                    ← Paginated feed with category filters
  FeedItem.tsx                ← Individual item card
  SignupModal.tsx             ← Email capture + digest day preference
  SubmitForm.tsx              ← Community submission form
  CategoryFilter.tsx          ← Filter tabs (Launch/News/Update/Research)
  AdminQueue.tsx              ← Moderation dashboard (password-protected)
  ui/                         ← shadcn/ui primitives (auto-generated)

lib/
  supabase.ts                 ← supabaseAdmin (service) + supabase (anon) clients
  rss.ts                      ← RSS fetcher + parser (rss-parser)
  summarize.ts                ← Claude API summarization → {summary, category}
  email.ts                    ← Resend client + email templates
  sources.ts                  ← RSS_SOURCES array (source of truth for feeds)
```

## Cron Schedule (vercel.json)
- Ingest: every 6 hours (`0 */6 * * *`)
- Digest Friday: `0 14 * * 5` (2pm UTC)
- Digest Monday: `0 8 * * 1` (8am UTC)
- All cron routes protected by `Authorization: Bearer $CRON_SECRET`

## Cron Route Protection
All `/api/cron/*` routes check:
```ts
if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## shadcn/ui Usage
- Initialized with Tailwind v4 defaults
- Always install components with: `npx shadcn@latest add [component]`
- Use shadcn primitives for all UI — Card, Button, Input, Badge, Dialog, Tabs, etc.
- Do not write raw HTML/CSS where a shadcn component exists

## Claude Summarization
- Model: `claude-haiku-4-5-20251001` (fast + cheap for bulk ingestion)
- Input: article title + first 1500 chars of content
- Output: `{ summary: string (max 300 chars), category: 'launch'|'news'|'update'|'research' }`
- Falls back to title + hint category on error

## RSS Sources (lib/sources.ts)
OpenAI, Anthropic, Google DeepMind, Hugging Face, Mistral, Stability AI, a16z AI, TechCrunch AI, VentureBeat AI, The Batch, Papers With Code, Hacker News AI filter, Product Hunt AI

## Build Order (completed steps)
- [x] Step 1: Next.js scaffold + shadcn/ui init + supabase/schema.sql + lib/sources.ts
- [x] Step 2: lib/supabase.ts + lib/rss.ts + lib/summarize.ts
- [x] Step 3: app/api/cron/ingest/route.ts
- [x] Step 4: app/api/feed/route.ts + Feed.tsx + FeedItem.tsx + CategoryFilter.tsx + app/page.tsx
- [x] Step 5: SignupModal.tsx + app/api/subscribe/route.ts
- [x] Step 6: lib/email.ts + app/api/cron/digest/route.ts + app/unsubscribe/page.tsx
- [x] Step 7: SubmitForm.tsx + app/submit/page.tsx + app/api/submit/route.ts
- [x] Step 8: AdminQueue.tsx + app/api/moderate/route.ts + app/admin/page.tsx
- [x] Step 9: vercel.json + .env.local.example + README.md

## Build complete — ready for deployment
