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

const TYPE_LABELS: Record<FeedItemData['category'], string> = {
  launch: 'Launch',
  news: 'News',
  update: 'Update',
  research: 'Paper',
}

const TOPIC_LABELS: Record<NonNullable<FeedItemData['topic']>, string> = {
  design: 'Design Tools',
  models: 'Models & AI',
  product: 'Product',
  research: 'Research',
  industry: 'Industry',
}

function timeAgo(dateStr: string): string {
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
      className="group w-full text-left flex items-start justify-between gap-4 rounded-lg px-4 py-3.5 -mx-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {item.topic && (
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {TOPIC_LABELS[item.topic]}
            </span>
          )}
          <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
            {TYPE_LABELS[item.category]}
          </span>
          <span className="text-xs text-muted-foreground">{item.source}</span>
          <span className="text-xs text-muted-foreground/50">·</span>
          <span className="text-xs text-muted-foreground/70">{timeAgo(item.published_at)}</span>
        </div>
        <p className="text-sm font-medium leading-snug text-foreground group-hover:text-foreground/80 line-clamp-2">
          {item.title}
        </p>
        {item.summary && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {item.summary}
          </p>
        )}
      </div>
    </button>
  )
}
