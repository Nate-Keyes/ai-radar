import { SubmitForm } from '@/components/SubmitForm'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata = {
  title: 'Submit a link — AI Radar',
  description: 'Submit an AI tool launch, news story, or research paper to the AI Radar feed.',
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="mb-6">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 mb-4 flex items-center gap-1.5 text-muted-foreground')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to feed
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">Submit a link</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Found something worth sharing? Community submissions are reviewed before going live.
          </p>
          <Separator className="mt-5" />
        </div>

        <SubmitForm />
      </div>
    </div>
  )
}
