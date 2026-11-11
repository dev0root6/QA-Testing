import { NextResponse } from 'next/server';

const PUBLIC = ['/login', '/api/auth', '/amuku-dumuku', '/api/amuku-dumuku'];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p + '/'))) return NextResponse.next();
  if (req.cookies.get('aits_session')?.value) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
