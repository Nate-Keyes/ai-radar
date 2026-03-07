import { ExternalLink } from 'lucide-react'

export interface FeedItemData {
  id: string
  title: string
  url: string
  summary: string | null
  category: 'launch' | 'news' | 'update' | 'research'
  source: string
  published_at: string
}

const CATEGORY_LABELS: Record<FeedItemData['category'], string> = {
  launch: 'Launch',
  news: 'News',
  update: 'Update',
  research: 'Research',
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
}

export function FeedItem({ item }: FeedItemProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start justify-between gap-4 rounded-lg px-4 py-3.5 -mx-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {CATEGORY_LABELS[item.category]}
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
      <ExternalLink className="w-3.5 h-3.5 mt-1 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
    </a>
  )
}
