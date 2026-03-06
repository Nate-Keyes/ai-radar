# AI Radar

A live feed of AI tool launches, news, updates, and research — aggregated from 13 RSS sources, summarized by Claude, and delivered as a weekly digest.

## What it does

- **Live feed** — ingests RSS feeds every 6 hours, deduplicates, and uses Claude Haiku to write a 1–2 sentence summary and classify each item (launch / news / update / research)
- **Weekly digest** — subscribers choose Friday 2pm UTC or Monday 8am UTC delivery
- **Community submissions** — anyone can submit a link; goes into a moderation queue before going live
- **Admin dashboard** — `/admin` lets you approve or reject pending submissions

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Database | Supabase (Postgres + RLS) |
| Hosting + Cron | Vercel |
| Email | Resend |
| AI Summarization | Anthropic Claude Haiku |
| UI | shadcn/ui + Tailwind CSS v4 |

## Setup

### 1. Clone and install

```bash
git clone https://github.com/Nate-Keyes/ai-radar.git
cd ai-radar
nvm use        # uses .nvmrc → Node 20
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`. See `.env.local.example` for descriptions of each variable.

### 3. Supabase — create tables

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your project URL and keys into `.env.local`

### 4. Resend — configure sending domain

1. Create an account at [resend.com](https://resend.com)
2. Add and verify your sending domain
3. Update the `FROM` address in `lib/email.ts` to match your verified domain
4. Add your API key to `.env.local`

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To test the ingest cron locally:
```bash
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron/ingest
```

To test the digest (with day override):
```bash
curl -H "Authorization: Bearer your-cron-secret" "http://localhost:3000/api/cron/digest?day=friday"
```

## Deployment (Vercel)

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new)
2. Add all environment variables from `.env.local.example` in the Vercel dashboard
3. Set `CRON_SECRET` in Vercel env vars — Vercel automatically sends it as `Authorization: Bearer <token>` for cron jobs
4. Deploy — cron jobs in `vercel.json` activate automatically on Vercel Pro (or Hobby with limits)

### Cron schedule

| Job | Schedule | Description |
|---|---|---|
| `/api/cron/ingest` | Every 6 hours | Fetch RSS, summarize new items with Claude |
| `/api/cron/digest` | Friday 2pm UTC | Send digest to Friday subscribers |
| `/api/cron/digest` | Monday 8am UTC | Send digest to Monday subscribers |

## Pages

| Route | Description |
|---|---|
| `/` | Live feed with category filters |
| `/submit` | Community link submission |
| `/admin` | Moderation queue (password-protected) |
| `/unsubscribe` | One-click unsubscribe |

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/feed` | Paginated feed (`?page=&category=`) |
| POST | `/api/subscribe` | Subscribe (`{ email, digest_day }`) |
| POST | `/api/subscribe/unsubscribe` | Unsubscribe (`{ email }`) |
| POST | `/api/submit` | Submit a community link |
| GET | `/api/moderate` | List submissions by status (admin) |
| POST | `/api/moderate` | Approve or reject a submission (admin) |
| GET | `/api/cron/ingest` | RSS ingest (cron, requires `CRON_SECRET`) |
| GET | `/api/cron/digest` | Send digest (cron, requires `CRON_SECRET`) |

## RSS Sources

OpenAI, Anthropic, Google DeepMind, Hugging Face, Mistral, Stability AI, a16z AI, TechCrunch AI, VentureBeat AI, The Batch (DeepLearning.AI), Papers With Code, Hacker News AI, Product Hunt AI

To add more sources, edit `lib/sources.ts`.
