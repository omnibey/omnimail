import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // Static assets and internal next requests pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 20
  );

  let user: any = null;
  let userRole: string = 'user';

  if (isConfigured) {
    const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      // Check user role from profile or metadata
      userRole = user.user_metadata?.role || (user.app_metadata?.role as string) || 'user';
    }
  } else {
    // Development fallback: check dev cookies
    const devSession = request.cookies.get('omnibey_dev_session');
    const devRole = request.cookies.get('omnibey_dev_role')?.value || 'admin';
    if (devSession) {
      user = { id: 'dev-user-123', email: 'developer@omnibey.com' };
      userRole = devRole;
    }
  }

  // 1. Protected User Routes: /dashboard/*
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2. Protected Admin Routes: /admin/*
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    if (userRole !== 'admin') {
      // Non-admin user attempting to access /admin is blocked and redirected to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. Authenticated users visiting /login or /signup
  if ((pathname === '/login' || pathname === '/signup') && user) {
    // Allow staying or redirect to dashboard
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/signup'],
};
