import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Skip public paths
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname === '/login' ||
        pathname === '/api/auth/login' ||
        pathname === '/favicon.ico' ||
        request.method === 'OPTIONS' // Allow CORS preflight requests
    ) {
        return NextResponse.next();
    }

    const appPassword = process.env.APP_PASSWORD;
    if (!appPassword) {
        // If no password set, allow everything (dev mode or unconfigured)
        return NextResponse.next();
    }

    // 2. API Routes: Check Header OR Cookie
    if (pathname.startsWith('/api')) {
        const authHeader = request.headers.get('x-lc-helper-auth');
        const authCookie = request.cookies.get('lc_helper_auth');

        if (authHeader === appPassword || authCookie?.value === appPassword) {
            return NextResponse.next();
        }

        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    // 3. Page Routes: Check Cookie Only
    const authCookie = request.cookies.get('lc_helper_auth');
    if (authCookie?.value === appPassword) {
        return NextResponse.next();
    }

    // Redirect to login if not authenticated
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
