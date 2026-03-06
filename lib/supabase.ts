import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Service client — full access, server-side only (API routes, cron jobs)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Anon client — public read access, safe for client components
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
