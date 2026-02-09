import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function getAuthUser(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name || null,
    businessName: user.user_metadata?.businessName || null,
    stripeConnected: user.user_metadata?.stripeConnected || false,
    stripeAccountId: user.user_metadata?.stripeAccountId || null,
    commissionRate: user.user_metadata?.commissionRate || 0.03,
    createdAt: user.created_at,
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }
  return user
}
