'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!email) {
      setStatus('error')
      setMessage('No email address provided.')
    }
  }, [email])

  const handleUnsubscribe = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: decodeURIComponent(email) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error ?? 'Something went wrong.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setMessage('Network error. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="max-w-sm w-full text-center space-y-4">
      {status === 'success' ? (
        <>
          <p className="text-2xl">👋</p>
          <h1 className="text-lg font-semibold">You&apos;ve been unsubscribed</h1>
          <p className="text-sm text-muted-foreground">
            You won&apos;t receive any more digest emails. You can resubscribe anytime.
          </p>
          <Link href="/" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            Back to AI Radar
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-lg font-semibold">Unsubscribe from AI Radar</h1>
          <p className="text-sm text-muted-foreground">
            {email
              ? <>Remove <strong>{decodeURIComponent(email)}</strong> from the weekly digest.</>
              : 'No email address found in the link.'}
          </p>
          {status === 'error' && (
            <p className="text-sm text-destructive">{message}</p>
          )}
          <div className="flex justify-center gap-2">
            <Link href="/" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Cancel
            </Link>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleUnsubscribe}
              disabled={!email || status === 'loading'}
            >
              {status === 'loading' ? 'Removing…' : 'Unsubscribe'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  )
}
