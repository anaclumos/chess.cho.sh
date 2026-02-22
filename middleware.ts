import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const VALID_LOCALES = new Set(['en', 'ko'])

export function middleware(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang')

  if (lang && VALID_LOCALES.has(lang)) {
    const response = NextResponse.next()
    response.cookies.set('NEXT_LOCALE', lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
