'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Session } from '@supabase/supabase-js'
import { SignupModal } from './SignupModal'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export function HeaderActions() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link href="/submit" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
        Submit
      </Link>
      {!loading && (
        session
          ? <UnsubscribeButton email={session.user.email!} />
          : <SignupModal />
      )}
    </div>
  )
}

function UnsubscribeButton({ email }: { email: string }) {
  const [loading, setLoading] = useState(false)

  const handleUnsubscribe = async () => {
    setLoading(true)
    try {
      await fetch('/api/subscribe/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {
      // ignore — still sign out
    }
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    setLoading(false)
  }

  return (
    <Button size="sm" variant="outline" onClick={handleUnsubscribe} disabled={loading}>
      {loading ? 'Unsubscribing…' : 'Unsubscribe'}
    </Button>
  )
}
