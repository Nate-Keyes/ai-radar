'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field'
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

      <DialogContent className="sm:max-w-sm">
        {status === 'success' ? (
          <div className="flex flex-col gap-6 text-center py-2">
            <DialogTitle className="sr-only">Subscribed</DialogTitle>
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold tracking-tight">You&apos;re subscribed!</h2>
              <p className="text-sm text-muted-foreground">
                Your weekly AI digest will arrive every{' '}
                {digestDay === 'friday' ? 'Friday at 2pm UTC' : 'Monday at 8am UTC'}.
              </p>
            </div>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                Subscribe to AI Radar
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Get a weekly digest of AI launches, news, and research.
              </p>
            </div>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </Field>

              <Field>
                <FieldLabel>Delivery day</FieldLabel>
                <ToggleGroup
                  value={[digestDay]}
                  onValueChange={(v) => v.length > 0 && setDigestDay(v[v.length - 1] as DigestDay)}
                  className="grid grid-cols-2 gap-2 w-full"
                  spacing={1}
                >
                  <ToggleGroupItem
                    value="friday"
                    className="h-auto flex-col items-start px-3 py-2.5 text-left"
                  >
                    <span className="text-sm font-medium">Friday</span>
                    <span className="text-xs text-muted-foreground mt-0.5">2pm UTC</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="monday"
                    className="h-auto flex-col items-start px-3 py-2.5 text-left"
                  >
                    <span className="text-sm font-medium">Monday</span>
                    <span className="text-xs text-muted-foreground mt-0.5">8am UTC</span>
                  </ToggleGroupItem>
                </ToggleGroup>
                <FieldDescription>
                  Choose when you&apos;d like to receive your digest.
                </FieldDescription>
              </Field>

              {status === 'error' && (
                <FieldError>{errorMsg}</FieldError>
              )}

              <Field>
                <Button type="submit" disabled={status === 'loading'} className="w-full">
                  {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
