import { Feed } from '@/components/Feed'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SignupModal } from '@/components/SignupModal'
import Link from 'next/link'
import { Rss } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Rss className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-semibold tracking-tight">AI Radar</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Launches, news, and research from across the AI ecosystem — updated every 6 hours.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/submit" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                Submit
              </Link>
              <SignupModal />
            </div>
          </div>
          <Separator className="mt-6" />
        </header>

        {/* Feed */}
        <Feed />

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border/40">
          <p className="text-xs text-muted-foreground text-center">
            AI Radar · Updated every 6 hours ·{' '}
            <Link href="/submit" className="underline underline-offset-2 hover:text-foreground">
              Submit a link
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
