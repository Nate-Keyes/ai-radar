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

function getFaviconUrl(url: string): string {
  try {
    const { hostname } = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
  } catch {
    return ''
  }
}

interface FeedItemProps {
  item: FeedItemData
}

export function FeedItem({ item }: FeedItemProps) {
  const faviconUrl = getFaviconUrl(item.url)

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-lg px-4 py-3 -mx-4 transition-colors hover:bg-muted/50"
    >
      {/* Favicon */}
      <div className="shrink-0 mt-0.5 w-5 h-5 rounded-sm overflow-hidden bg-muted flex items-center justify-center">
        {faviconUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={faviconUrl}
            alt=""
            width={20}
            height={20}
            className="w-full h-full object-contain"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">{item.source}</span>
          <span className="text-xs text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground/60">{timeAgo(item.published_at)}</span>
          {item.topic && (
            <>
              <span className="text-xs text-muted-foreground/40">·</span>
              <span className="text-xs text-primary/70 font-medium">{TOPIC_LABELS[item.topic]}</span>
            </>
          )}
        </div>
        <p className="text-sm font-medium leading-snug text-foreground group-hover:text-foreground/80 line-clamp-1">
          {item.title}
        </p>
        {item.summary && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {item.summary}
          </p>
        )}
      </div>
    </a>
  )
}
