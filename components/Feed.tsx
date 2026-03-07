'use client'

import { useState, useEffect, useCallback } from 'react'
import { FeedItem, type FeedItemData } from './FeedItem'
import { FeedFilters, type TopicOption, type TypeOption } from './FeedFilters'
import { ArticleSheet } from './ArticleSheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

function FeedSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-4 py-3.5 -mx-4 space-y-2">
          <div className="flex gap-2 items-center">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  )
}

export function Feed() {
  const [topic, setTopic] = useState<TopicOption>('all')
  const [type, setType] = useState<TypeOption>('all')
  const [items, setItems] = useState<FeedItemData[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<FeedItemData | null>(null)

  const fetchItems = useCallback(async (
    tp: TopicOption,
    ty: TypeOption,
    pg: number,
    append: boolean
  ) => {
    try {
      const params = new URLSearchParams({ page: String(pg), limit: '20' })
      if (tp !== 'all') params.set('topic', tp)
      if (ty !== 'all') params.set('category', ty)
      const res = await fetch(`/api/feed?${params}`)
      if (!res.ok) throw new Error('Failed to load feed')
      const data = await res.json()
      setItems((prev) => append ? [...prev, ...data.items] : data.items)
      setHasMore(data.hasMore)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }, [])

  // Reset and reload when filters change
  useEffect(() => {
    setLoading(true)
    setPage(1)
    setError(null)
    fetchItems(topic, type, 1, false).finally(() => setLoading(false))
  }, [topic, type, fetchItems])

  const loadMore = async () => {
    const nextPage = page + 1
    setLoadingMore(true)
    await fetchItems(topic, type, nextPage, true)
    setPage(nextPage)
    setLoadingMore(false)
  }

  return (
    <div className="space-y-4">
      <FeedFilters
        topic={topic}
        onTopicChange={setTopic}
        type={type}
        onTypeChange={setType}
      />
      <Separator />

      {loading ? (
        <FeedSkeleton />
      ) : error ? (
        <p className="text-sm text-destructive py-8 text-center">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          No items yet — check back soon.
        </p>
      ) : (
        <>
          <div>
            {items.map((item) => (
              <FeedItem key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </div>

          {hasMore && (
            <div className="pt-2 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}

      <ArticleSheet
        item={selectedItem}
        open={selectedItem !== null}
        onOpenChange={(open) => { if (!open) setSelectedItem(null) }}
      />
    </div>
  )
}
