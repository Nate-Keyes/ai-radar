import { AdminQueue } from '@/components/AdminQueue'

export const metadata = {
  title: 'Admin — AI Radar',
}

// Prevent this page from being indexed
export const robots = { index: false, follow: false }

export default function AdminPage() {
  return <AdminQueue />
}
