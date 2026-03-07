'use client'

import { ExternalLink } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { TOPIC_LABELS, TYPE_LABELS, timeAgo, type FeedItemData } from './FeedItem'

interface ArticleSheetProps {
  item: FeedItemData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ArticleSheet({ item, open, onOpenChange }: ArticleSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto flex flex-col gap-0">
        {item && (
          <div className="flex flex-col gap-6 pt-2">
            <SheetHeader className="gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {item.topic && (
                  <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {TOPIC_LABELS[item.topic]}
                  </span>
                )}
                <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  {TYPE_LABELS[item.category]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.source} · {timeAgo(item.published_at)}
                </span>
              </div>
              <SheetTitle className="text-base font-semibold leading-snug text-left">
                {item.title}
              </SheetTitle>
            </SheetHeader>

            {item.summary ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No summary available.</p>
            )}

            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              Open article
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
