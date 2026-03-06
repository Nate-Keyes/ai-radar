'use client'

import Link from 'next/link'
import { SignupModal } from './SignupModal'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link href="/submit" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
        Submit
      </Link>
      <SignupModal />
    </div>
  )
}
