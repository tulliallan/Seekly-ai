import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const type = searchParams.get('type')

  if (!token || type !== 'signup') {
    return NextResponse.redirect(new URL('/auth/verify-error', request.url))
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'signup'
    })

    if (error) {
      throw error
    }

    return NextResponse.redirect(new URL('/auth/verify-success', request.url))
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.redirect(new URL('/auth/verify-error', request.url))
  }
} 