'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import type { FeedItemData } from './FeedItem'

interface ArticleSheetProps {
  item: FeedItemData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ReaderResult {
  title: string
  byline: string | null
  content: string
  excerpt: string | null
}

function ArticleSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/3" />
      <div className="space-y-2 pt-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

export function ArticleSheet({ item, open, onOpenChange }: ArticleSheetProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReaderResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !item) return

    setLoading(true)
    setResult(null)
    setError(null)

    fetch(`/api/reader?url=${encodeURIComponent(item.url)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setResult(data as ReaderResult)
        }
      })
      .catch(() => setError('Failed to load article'))
      .finally(() => setLoading(false))
  }, [open, item])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto flex flex-col gap-0 p-0">
        {item && (
          <>
            <SheetHeader className="sticky top-0 bg-background border-b border-border px-6 py-4 z-10">
              <div className="flex items-start justify-between gap-4">
                <SheetTitle className="text-sm font-medium leading-snug text-left">
                  {item.source} · {item.title}
                </SheetTitle>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 -mr-1"
                    onClick={() => onOpenChange(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetHeader>

            <div className="px-6 py-6 flex-1">
              {loading ? (
                <ArticleSkeleton />
              ) : error || !result ? (
                <div className="space-y-4">
                  <p className="text-sm font-semibold leading-snug">{item.title}</p>
                  {item.summary && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
                  )}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
                  >
                    Open full article
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <h1 className="text-base font-semibold leading-snug">{result.title}</h1>
                  {result.byline && (
                    <p className="text-xs text-muted-foreground">{result.byline}</p>
                  )}
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed
                      [&>p]:mb-4 [&>h2]:text-sm [&>h2]:font-semibold [&>h2]:mt-6 [&>h2]:mb-2
                      [&>h3]:text-sm [&>h3]:font-medium [&>h3]:mt-4 [&>h3]:mb-1
                      [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-4
                      [&_li]:mb-1 [&>blockquote]:border-l-2 [&>blockquote]:border-border
                      [&>blockquote]:pl-3 [&>blockquote]:text-muted-foreground [&>blockquote]:italic
                      [&_img]:max-w-full [&_img]:rounded-md [&_a]:underline [&_a]:underline-offset-2"
                    dangerouslySetInnerHTML={{ __html: result.content }}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
