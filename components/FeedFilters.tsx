'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type TopicOption = 'all' | 'design' | 'models' | 'product' | 'research' | 'industry'
export type TypeOption = 'all' | 'launch' | 'news' | 'update' | 'research'

const TOPICS: { value: TopicOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'design', label: 'Design Tools' },
  { value: 'models', label: 'Models & AI' },
  { value: 'product', label: 'Product' },
  { value: 'research', label: 'Research' },
  { value: 'industry', label: 'Industry' },
]

const TYPES: { value: TypeOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'launch', label: 'Launch' },
  { value: 'news', label: 'News' },
  { value: 'update', label: 'Update' },
  { value: 'research', label: 'Paper' },
]

interface FeedFiltersProps {
  topic: TopicOption
  onTopicChange: (value: TopicOption) => void
  type: TypeOption
  onTypeChange: (value: TypeOption) => void
}

export function FeedFilters({ topic, onTopicChange, type, onTypeChange }: FeedFiltersProps) {
  return (
    <div className="space-y-2">
      <Tabs value={topic} onValueChange={(v) => onTopicChange(v as TopicOption)}>
        <TabsList className="h-9 flex-wrap">
          {TOPICS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-sm">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Tabs value={type} onValueChange={(v) => onTypeChange(v as TypeOption)}>
        <TabsList className="h-9">
          {TYPES.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
