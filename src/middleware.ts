import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that should be accessible during maintenance
const allowedPaths = [
  '/maintenance',
  '/_next',
  '/favicon.ico',
  '/api/status',
]

export async function middleware(req: NextRequest) {
  // Check if the requested path is allowed during maintenance
  const isAllowedPath = allowedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  // If not an allowed path, redirect to maintenance page
  if (!isAllowedPath) {
    return NextResponse.redirect(new URL('/maintenance', req.url))
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Only redirect from auth pages if user is logged in
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  // For admin routes, check if user is an admin
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', session?.user?.id)
      .single()

    if (!adminData) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!maintenance|_next/static|_next/image|favicon.ico).*)'],
} 