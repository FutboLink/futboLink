import { NextRequest, NextResponse } from 'next/server';

// Define routes that should be handled by the server API
const API_ROUTES = [
  '/api/success-cases',
  '/api/News',
  '/api/videos',
  '/api/login',
];

// Get the API URL from environment variables with a fallback
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://futbolink.onrender.com';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if it's an RSC (React Server Component) request 
  // or a request to a known API route without the /api prefix
  if (request.headers.get('RSC') === '1' || 
      request.headers.get('Next-Router-Prefetch') === '1' ||
      request.headers.get('x-nextjs-data') === '1') {
    
    console.log('Intercepted RSC request for:', pathname);
    
    // Don't intercept requests that should go to the Next.js API routes
    if (API_ROUTES.some(route => pathname.startsWith(route))) {
      console.log('Allowing RSC request to API route:', pathname);
      return NextResponse.next();
    }
    
    // Don't intercept specific path patterns for Next.js internals
    if (pathname.includes('_next') || 
        pathname.includes('favicon.ico') ||
        pathname === '/') {
      return NextResponse.next();
    }
    
    // For other paths, like /success-cases, /News, /videos, rewrite to the API route
    const apiPathname = `/api${pathname}`;
    console.log(`Rewriting RSC request to API path: ${apiPathname}`);
    
    const url = request.nextUrl.clone();
    url.pathname = apiPathname;
    
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except _next, assets, etc.
    '/((?!_next/|api/|assets/|favicon.ico).*)',
  ],
}; 