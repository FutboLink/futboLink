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
  const method = request.method;
  
  console.log(`Middleware intercepted: ${method} ${pathname}`);
  
  // Special handling for API routes to ensure CORS headers
  if (pathname.startsWith('/api/')) {
    // For API OPTIONS requests (CORS preflight), add CORS headers
    if (method === 'OPTIONS') {
      console.log('Handling CORS preflight for API route:', pathname);
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    
    // Let API routes be handled by their route handlers
    console.log('Allowing API request to proceed:', pathname);
    return NextResponse.next();
  }
  
  // Check if it's an RSC (React Server Component) request 
  // or a request to a known API route without the /api prefix
  if (request.headers.get('RSC') === '1' || 
      request.headers.get('Next-Router-Prefetch') === '1' ||
      request.headers.get('x-nextjs-data') === '1') {
    
    console.log('Intercepted RSC request for:', pathname);
    
    // Don't intercept specific path patterns for Next.js internals
    if (pathname.includes('_next') || 
        pathname.includes('favicon.ico') ||
        pathname === '/') {
      return NextResponse.next();
    }
    
    // For paths like /login, /success-cases, /News, /videos, rewrite to the API route
    if (pathname === '/login' || pathname.startsWith('/success-cases') || 
        pathname.startsWith('/News') || pathname.startsWith('/videos')) {
      const apiPathname = `/api${pathname}`;
      console.log(`Rewriting request to API path: ${apiPathname}`);
      
      const url = request.nextUrl.clone();
      url.pathname = apiPathname;
      
      return NextResponse.rewrite(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static assets
    '/((?!_next/static|assets/|favicon.ico).*)',
    // Include API routes for CORS handling
    '/api/:path*',
  ],
}; 