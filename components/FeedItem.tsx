import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

const CATEGORY_STYLES: Record<FeedItemData['category'], string> = {
  launch: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  news: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  update: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  research: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
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
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="block group">
      <Card className="transition-colors hover:bg-muted/50 border-border/60">
        <CardContent className="py-4 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge
                  variant="outline"
                  className={`text-xs font-medium capitalize ${CATEGORY_STYLES[item.category]}`}
                >
                  {item.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{item.source}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{timeAgo(item.published_at)}</span>
              </div>
              <h3 className="font-medium text-sm leading-snug text-foreground group-hover:text-foreground/80 line-clamp-2">
                {item.title}
              </h3>
              {item.summary && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              )}
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground mt-0.5 shrink-0" />
          </div>
        </CardContent>
      </Card>
    </a>
  )
}
