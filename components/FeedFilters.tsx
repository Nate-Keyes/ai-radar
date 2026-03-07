'use client'

import { Search } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'

export type TopicOption = 'all' | 'design' | 'models' | 'product' | 'research' | 'industry'

const TOPICS: { value: TopicOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'design', label: 'Design Tools' },
  { value: 'models', label: 'Models & AI' },
  { value: 'product', label: 'Product' },
  { value: 'research', label: 'Research' },
  { value: 'industry', label: 'Industry' },
]

interface FeedFiltersProps {
  topic: TopicOption
  onTopicChange: (value: TopicOption) => void
  search: string
  onSearchChange: (value: string) => void
}

export function FeedFilters({ topic, onTopicChange, search, onSearchChange }: FeedFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tabs value={topic} onValueChange={(v) => onTopicChange(v as TopicOption)} className="flex-1 min-w-0">
        <TabsList className="h-9">
          {TOPICS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-sm">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="relative w-44 shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="pl-8 h-9 text-sm"
        />
      </div>
    </div>
  )
}
