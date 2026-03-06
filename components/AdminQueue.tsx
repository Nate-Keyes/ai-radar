'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ExternalLink, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface Submission {
  id: string
  title: string
  url: string
  description: string | null
  submitter_email: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

type Filter = 'pending' | 'approved' | 'rejected'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const STATUS_STYLES: Record<Filter, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
}

export function AdminQueue() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [filter, setFilter] = useState<Filter>('pending')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const fetchSubmissions = useCallback(async (pw: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/moderate?status=${filter}`, {
        headers: { 'x-admin-password': pw },
      })
      if (res.status === 401) {
        setAuthed(false)
        setAuthError('Wrong password.')
        return
      }
      const data = await res.json()
      setSubmissions(data.submissions ?? [])
    } catch {
      showToast('Failed to load submissions.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (authed) fetchSubmissions(password)
  }, [authed, filter, fetchSubmissions, password])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthed(true)
  }

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id)
    try {
      const res = await fetch('/api/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ id, action }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error ?? 'Action failed.')
        return
      }
      showToast(action === 'approve' ? '✓ Approved and added to feed' : '✗ Rejected')
      setSubmissions((prev) => prev.filter((s) => s.id !== id))
    } catch {
      showToast('Network error.')
    } finally {
      setActionLoading(null)
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4">
          <div>
            <h1 className="text-lg font-semibold">Admin — AI Radar</h1>
            <p className="text-sm text-muted-foreground">Enter your admin password to continue.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>
            {authError && <p className="text-sm text-destructive">{authError}</p>}
            <Button type="submit" className="w-full" size="sm">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    )
  }

  const counts = { pending: 0, approved: 0, rejected: 0 }
  // We only have the current filter's data, so just show what we have
  const filtered = submissions

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Moderation Queue</h1>
            <p className="text-sm text-muted-foreground">Review community submissions</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchSubmissions(password)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 border-b border-border/60 pb-0">
          {(['pending', 'approved', 'rejected'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-sm capitalize transition-colors border-b-2 -mb-px ${
                filter === f
                  ? 'border-foreground text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Toast */}
        {toast && (
          <Alert className="py-2 px-3 text-sm">{toast}</Alert>
        )}

        {/* List */}
        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            No {filter} submissions.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((sub) => (
              <Card key={sub.id} className="border-border/60">
                <CardContent className="py-4 px-5 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${STATUS_STYLES[sub.status]}`}
                        >
                          {sub.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{timeAgo(sub.created_at)}</span>
                        {sub.submitter_email && (
                          <span className="text-xs text-muted-foreground">· {sub.submitter_email}</span>
                        )}
                      </div>
                      <h3 className="font-medium text-sm leading-snug">{sub.title}</h3>
                      {sub.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{sub.description}</p>
                      )}
                      <a
                        href={sub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {sub.url.length > 60 ? sub.url.slice(0, 60) + '…' : sub.url}
                      </a>
                    </div>
                  </div>

                  {sub.status === 'pending' && (
                    <>
                      <Separator />
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-emerald-600 hover:text-emerald-700 hover:border-emerald-500/40"
                          onClick={() => handleAction(sub.id, 'approve')}
                          disabled={actionLoading === sub.id}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {actionLoading === sub.id ? 'Working…' : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-red-600 hover:text-red-700 hover:border-red-500/40"
                          onClick={() => handleAction(sub.id, 'reject')}
                          disabled={actionLoading === sub.id}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
