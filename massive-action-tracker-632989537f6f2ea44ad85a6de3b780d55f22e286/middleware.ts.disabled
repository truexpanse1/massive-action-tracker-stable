// middleware.ts (root of project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This runs on normal pages but NOT on /api routes because of the matcher below
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// THIS LINE IS THE FIX – tells Vercel to completely ignore /api routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
