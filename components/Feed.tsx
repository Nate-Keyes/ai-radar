'use client'

import { useState, useEffect, useCallback } from 'react'
import { FeedItem, type FeedItemData } from './FeedItem'
import { CategoryFilter, type CategoryOption } from './CategoryFilter'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

function FeedSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border/60 px-5 py-4 space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  )
}

export function Feed() {
  const [category, setCategory] = useState<CategoryOption>('all')
  const [items, setItems] = useState<FeedItemData[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async (cat: CategoryOption, pg: number, append: boolean) => {
    try {
      const params = new URLSearchParams({ page: String(pg), limit: '20' })
      if (cat !== 'all') params.set('category', cat)
      const res = await fetch(`/api/feed?${params}`)
      if (!res.ok) throw new Error('Failed to load feed')
      const data = await res.json()
      setItems((prev) => append ? [...prev, ...data.items] : data.items)
      setHasMore(data.hasMore)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }, [])

  // Initial load + category change
  useEffect(() => {
    setLoading(true)
    setPage(1)
    setError(null)
    fetchItems(category, 1, false).finally(() => setLoading(false))
  }, [category, fetchItems])

  const loadMore = async () => {
    const nextPage = page + 1
    setLoadingMore(true)
    await fetchItems(category, nextPage, true)
    setPage(nextPage)
    setLoadingMore(false)
  }

  return (
    <div className="space-y-4">
      <CategoryFilter value={category} onChange={setCategory} />
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
          <div className="space-y-2">
            {items.map((item) => (
              <FeedItem key={item.id} item={item} />
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
    </div>
  )
}
