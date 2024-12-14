import { auth } from './app/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  const isApiRoute = nextUrl.pathname.startsWith('/api')
  const isPublicRoute = ['/login', '/register'].includes(nextUrl.pathname)

  if (isApiRoute) return

  if (isPublicRoute && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', nextUrl))
  }

  if (!isPublicRoute && !isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl))
  }
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
