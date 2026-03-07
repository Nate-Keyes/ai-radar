export interface FeedItemData {
  id: string
  title: string
  url: string
  summary: string | null
  category: 'launch' | 'news' | 'update' | 'research'
  topic: 'design' | 'models' | 'product' | 'research' | 'industry' | null
  source: string
  published_at: string
}

export const TOPIC_LABELS: Record<NonNullable<FeedItemData['topic']>, string> = {
  design: 'Design Tools',
  models: 'Models & AI',
  product: 'Product',
  research: 'Research',
  industry: 'Industry',
}

export const TYPE_LABELS: Record<FeedItemData['category'], string> = {
  launch: 'Launch',
  news: 'News',
  update: 'Update',
  research: 'Paper',
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface FeedItemProps {
  item: FeedItemData
  onClick: (item: FeedItemData) => void
}

export function FeedItem({ item, onClick }: FeedItemProps) {
  return (
    <button
      onClick={() => onClick(item)}
      className="group w-full text-left flex items-center gap-3 rounded-lg px-4 py-2 -mx-4 transition-colors hover:bg-muted/50"
    >
      {item.topic && (
        <span className="shrink-0 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {TOPIC_LABELS[item.topic]}
        </span>
      )}
      <p className="flex-1 min-w-0 text-sm font-medium leading-snug text-foreground group-hover:text-foreground/80 truncate">
        {item.title}
      </p>
      <span className="shrink-0 text-xs text-muted-foreground/70 hidden sm:inline whitespace-nowrap">
        {item.source} · {timeAgo(item.published_at)}
      </span>
      <span className="shrink-0 text-xs text-muted-foreground/70 sm:hidden whitespace-nowrap">
        {timeAgo(item.published_at)}
      </span>
    </button>
  )
}
