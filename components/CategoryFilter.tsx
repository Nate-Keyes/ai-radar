'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type CategoryOption = 'all' | 'launch' | 'news' | 'update' | 'research'

const CATEGORIES: { value: CategoryOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'launch', label: 'Launches' },
  { value: 'news', label: 'News' },
  { value: 'update', label: 'Updates' },
  { value: 'research', label: 'Research' },
]

interface CategoryFilterProps {
  value: CategoryOption
  onChange: (value: CategoryOption) => void
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as CategoryOption)}>
      <TabsList className="h-9">
        {CATEGORIES.map((cat) => (
          <TabsTrigger key={cat.value} value={cat.value} className="text-sm">
            {cat.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
