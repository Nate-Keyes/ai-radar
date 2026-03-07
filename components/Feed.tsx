'use client'

import { useState, useEffect, useCallback } from 'react'
import { FeedItem, type FeedItemData } from './FeedItem'
import { FeedFilters, type TopicOption } from './FeedFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

function FeedSkeleton() {
  return (
    <div className="space-y-0.5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2 -mx-4">
          <Skeleton className="h-5 w-20 rounded-md shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-3 w-24 shrink-0 hidden sm:block" />
        </div>
      ))}
    </div>
  )
}

export function Feed() {
  const [topic, setTopic] = useState<TopicOption>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [items, setItems] = useState<FeedItemData[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Debounce search input 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchItems = useCallback(async (
    tp: TopicOption,
    q: string,
    pg: number,
    append: boolean
  ) => {
    try {
      const params = new URLSearchParams({ page: String(pg), limit: '20' })
      if (tp !== 'all') params.set('topic', tp)
      if (q.trim()) params.set('q', q.trim())
      const res = await fetch(`/api/feed?${params}`)
      if (!res.ok) throw new Error('Failed to load feed')
      const data = await res.json()
      setItems((prev) => append ? [...prev, ...data.items] : data.items)
      setHasMore(data.hasMore)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }, [])

  // Reset and reload when topic or debounced search changes
  useEffect(() => {
    setLoading(true)
    setPage(1)
    setError(null)
    fetchItems(topic, debouncedSearch, 1, false).finally(() => setLoading(false))
  }, [topic, debouncedSearch, fetchItems])

  const loadMore = async () => {
    const nextPage = page + 1
    setLoadingMore(true)
    await fetchItems(topic, debouncedSearch, nextPage, true)
    setPage(nextPage)
    setLoadingMore(false)
  }

  return (
    <div className="space-y-4">
      <FeedFilters
        topic={topic}
        onTopicChange={setTopic}
        search={search}
        onSearchChange={setSearch}
      />
      <Separator />

      {loading ? (
        <FeedSkeleton />
      ) : error ? (
        <p className="text-sm text-destructive py-8 text-center">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          {debouncedSearch ? `No results for "${debouncedSearch}"` : 'No items yet — check back soon.'}
        </p>
      ) : (
        <>
          <div>
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
