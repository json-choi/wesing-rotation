import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'admin-token';

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? 'fallback-secret-change-in-prod';
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  // Only protect /admin/dashboard routes
  if (!req.nextUrl.pathname.startsWith('/admin/dashboard')) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/admin', req.url));
  }
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
