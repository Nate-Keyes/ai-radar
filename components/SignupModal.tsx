'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { createSupabaseBrowserClient } from '@/lib/supabase'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ai-radar.vercel.app'

type DigestDay = 'friday' | 'monday'

export function SignupModal() {
  const [open, setOpen] = useState(false)
  const [digestDay, setDigestDay] = useState<DigestDay>('friday')
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${APP_URL}/auth/callback?day=${digestDay}`,
      },
    })
    // Page navigates away — no need to reset loading state
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>Subscribe</DialogTrigger>

      <DialogContent className="sm:max-w-sm">
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
            <FieldLabel>Delivery day</FieldLabel>
            <RadioGroup
              value={digestDay}
              onValueChange={(v) => setDigestDay(v as DigestDay)}
              className="grid grid-cols-2 gap-2"
            >
              {[
                { value: 'friday', label: 'Friday', time: '2pm UTC' },
                { value: 'monday', label: 'Monday', time: '8am UTC' },
              ].map(({ value, label, time }) => (
                <label
                  key={value}
                  htmlFor={`day-${value}`}
                  className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                    digestDay === value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem id={`day-${value}`} value={value} className="mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">{time}</span>
                  </div>
                </label>
              ))}
            </RadioGroup>
            <FieldDescription>
              Choose when you&apos;d like to receive your digest.
            </FieldDescription>
          </Field>

          <Field>
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full gap-2"
            >
              <GoogleIcon />
              {loading ? 'Redirecting…' : 'Continue with Google'}
            </Button>
          </Field>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.67 3.67 0 0 1-1.59 2.41v2h2.57c1.5-1.38 2.4-3.42 2.4-5.87Z" fill="#4285F4"/>
      <path d="M8 16c2.16 0 3.97-.72 5.29-1.94l-2.57-2a4.8 4.8 0 0 1-7.18-2.52H.88v2.07A8 8 0 0 0 8 16Z" fill="#34A853"/>
      <path d="M3.54 9.54A4.83 4.83 0 0 1 3.29 8c0-.54.09-1.06.25-1.54V4.39H.88A8.01 8.01 0 0 0 0 8c0 1.29.31 2.51.88 3.61l2.66-2.07Z" fill="#FBBC05"/>
      <path d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.37-2.37A7.94 7.94 0 0 0 8 0 8 8 0 0 0 .88 4.39l2.66 2.07A4.77 4.77 0 0 1 8 3.18Z" fill="#EA4335"/>
    </svg>
  )
}
