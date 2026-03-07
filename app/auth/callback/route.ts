import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const day = req.nextUrl.searchParams.get('day') ?? 'friday'
  const origin = req.nextUrl.origin

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session?.user?.email) {
      await supabaseAdmin
        .from('subscribers')
        .upsert(
          {
            email: session.user.email,
            digest_day: ['friday', 'monday'].includes(day) ? day : 'friday',
            confirmed: true,
          },
          { onConflict: 'email', ignoreDuplicates: false }
        )
    }
  }

  return NextResponse.redirect(new URL('/', origin))
}
