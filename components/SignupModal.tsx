'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type DigestDay = 'friday' | 'monday'

export function SignupModal() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [digestDay, setDigestDay] = useState<DigestDay>('friday')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), digest_day: digestDay }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setStatus('error')
        return
      }

      setStatus('success')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (!val) {
      // Reset form on close
      setTimeout(() => {
        setEmail('')
        setDigestDay('friday')
        setStatus('idle')
        setErrorMsg('')
      }, 200)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>Subscribe</DialogTrigger>

      <DialogContent>
        {status === 'success' ? (
          <div className="py-4 text-center space-y-2">
            <p className="text-2xl">🎉</p>
            <DialogTitle>You&apos;re subscribed!</DialogTitle>
            <DialogDescription>
              You&apos;ll get a weekly AI digest every{' '}
              {digestDay === 'friday' ? 'Friday at 2pm UTC' : 'Monday at 8am UTC'}.
            </DialogDescription>
            <div className="pt-2">
              <Button size="sm" variant="outline" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Subscribe to AI Radar</DialogTitle>
              <DialogDescription>
                Get a weekly digest of AI launches, news, and research delivered to your inbox.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label>Delivery day</Label>
                <ToggleGroup
                  value={[digestDay]}
                  onValueChange={(v) => v.length > 0 && setDigestDay(v[v.length - 1] as DigestDay)}
                  className="grid grid-cols-2 gap-2"
                  spacing={1}
                >
                  <ToggleGroupItem
                    value="friday"
                    className="h-auto flex-col items-start px-3 py-2.5 text-left"
                  >
                    <p className="font-medium text-sm">Friday</p>
                    <p className="text-xs mt-0.5 opacity-70">2pm UTC — start the weekend informed</p>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="monday"
                    className="h-auto flex-col items-start px-3 py-2.5 text-left"
                  >
                    <p className="font-medium text-sm">Monday</p>
                    <p className="text-xs mt-0.5 opacity-70">8am UTC — kick off the week</p>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {status === 'error' && (
                <p className="text-xs text-destructive">{errorMsg}</p>
              )}
            </div>

            <DialogFooter showCloseButton>
              <Button type="submit" size="sm" disabled={status === 'loading'}>
                {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
