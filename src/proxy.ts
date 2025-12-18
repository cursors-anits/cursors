import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const sessionCookie = request.cookies.get('vibe_session');
    const { pathname } = request.nextUrl;

    // 1. Protect all /dashboard routes
    if (pathname.startsWith('/dashboard')) {
        if (!sessionCookie) {
            // No session, redirect to home
            return NextResponse.redirect(new URL('/', request.url));
        }

        try {
            const user = JSON.parse(decodeURIComponent(sessionCookie.value));
            const role = user.role;

            // 2. Role-based path protection
            // If user tries to access a dashboard that doesn't match their role
            if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
                return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
            }
            if (pathname.startsWith('/dashboard/coordinator') && role !== 'coordinator') {
                return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
            }
            if (pathname.startsWith('/dashboard/faculty') && role !== 'faculty') {
                return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
            }
            if (pathname.startsWith('/dashboard/participant') && role !== 'participant') {
                return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
            }
        } catch {
            // Invalid cookie, clear and redirect
            const response = NextResponse.redirect(new URL('/', request.url));
            response.cookies.delete('vibe_session');
            return response;
        }
    }

    // 3. Prevent logged-in users from seeing the home page if they have a dashboard
    // (Optional: can be disabled if you want them to see the landing page too)
    /*
    if (pathname === '/' && sessionCookie) {
        try {
            const user = JSON.parse(decodeURIComponent(sessionCookie.value));
            return NextResponse.redirect(new URL(`/dashboard/${user.role}`, request.url));
        } catch (e) {}
    }
    */

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/'],
};
