import { Feed } from '@/components/Feed'
import { HeaderActions } from '@/components/HeaderActions'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-base font-semibold tracking-tight">AI Radar</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Launches, news, and research from the AI ecosystem.
              </p>
            </div>
            <HeaderActions />
          </div>
          <Separator className="mt-6" />
        </header>

        <Feed />

        <footer className="mt-16 pt-6 border-t border-border/40">
          <p className="text-xs text-muted-foreground text-center">
            Updated every 6 hours ·{' '}
            <Link href="/submit" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Submit a link
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
