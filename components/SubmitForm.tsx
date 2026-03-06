'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface FormState {
  title: string
  url: string
  description: string
  submitter_email: string
}

const EMPTY: FormState = { title: '', url: '', description: '', submitter_email: '' }

export function SubmitForm() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          url: form.url.trim(),
          description: form.description.trim() || undefined,
          submitter_email: form.submitter_email.trim() || undefined,
        }),
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

  if (status === 'success') {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-3xl">🎉</p>
        <h2 className="text-lg font-semibold">Submission received!</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Thanks for contributing. Your link will be reviewed and added to the feed if approved.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => { setForm(EMPTY); setStatus('idle') }}
        >
          Submit another
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. Anthropic releases Claude 4"
          value={form.title}
          onChange={set('title')}
          maxLength={200}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="url">
          URL <span className="text-destructive">*</span>
        </Label>
        <Input
          id="url"
          type="url"
          placeholder="https://..."
          value={form.url}
          onChange={set('url')}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Briefly describe what this is about…"
          value={form.description}
          onChange={set('description')}
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="submitter_email">
          Your email <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Input
          id="submitter_email"
          type="email"
          placeholder="you@example.com"
          value={form.submitter_email}
          onChange={set('submitter_email')}
        />
        <p className="text-xs text-muted-foreground">Only used to notify you if your link is approved.</p>
      </div>

      {status === 'error' && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}

      <Button type="submit" disabled={status === 'loading'} className="w-full">
        {status === 'loading' ? 'Submitting…' : 'Submit link'}
      </Button>
    </form>
  )
}
