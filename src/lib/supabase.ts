import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mtifgheijvznrrweznmo.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Server-side client (for API routes)
export const createServerClient = () => {
  return createClient(
    'https://mtifgheijvznrrweznmo.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
