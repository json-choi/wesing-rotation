import { NextRequest, NextResponse } from 'next/server';

// Better Auth sets this cookie on successful sign-in.
// Full session verification happens server-side in requireAuth() (lib/actions.ts).
const SESSION_COOKIE = 'better-auth.session_token';

export function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin/dashboard')) {
    return NextResponse.next();
  }

  const hasSession =
    req.cookies.has(SESSION_COOKIE) ||
    req.cookies.has(`__Secure-${SESSION_COOKIE}`);

  if (!hasSession) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
