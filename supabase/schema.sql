-- AI Radar — Supabase Schema

-- Items: ingested from RSS feeds, summarized by Claude
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null unique,
  summary text,
  category text check (category in ('launch', 'news', 'update', 'research')) not null default 'news',
  source text not null,
  published_at timestamptz not null,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists items_published_at_idx on items (published_at desc);
create index if not exists items_category_idx on items (category);
create index if not exists items_approved_idx on items (approved);

-- Migration: add topic column for role-aligned topic filtering
-- Run in Supabase SQL editor after initial schema is deployed:
-- ALTER TABLE items ADD COLUMN IF NOT EXISTS topic text CHECK (topic IN ('design','models','product','research','industry'));
-- CREATE INDEX IF NOT EXISTS items_topic_idx ON items(topic);

-- Subscribers: email + digest preference
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  digest_day text check (digest_day in ('friday', 'monday')) not null default 'friday',
  confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Submissions: community-submitted items, go through moderation
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  description text,
  submitter_email text,
  status text check (status in ('pending', 'approved', 'rejected')) not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists submissions_status_idx on submissions (status);

-- Sources: RSS feed sources for the ingest cron
create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  category text check (category in ('launch', 'news', 'update', 'research')) not null default 'news',
  active boolean not null default true
);

-- Enable Row Level Security
alter table items enable row level security;
alter table subscribers enable row level security;
alter table submissions enable row level security;
alter table sources enable row level security;

-- Public can read approved items
create policy "Public can read approved items"
  on items for select
  using (approved = true);

-- Service role has full access (used by API routes / cron) — bypasses RLS automatically
