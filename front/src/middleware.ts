import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the request is targeting an API route for success-cases
  const isSuccessCasesRoute = request.nextUrl.pathname.startsWith('/success-cases');
  
  // Get the response from the next middleware or route handler
  const response = NextResponse.next();
  
  // Log the request being processed in middleware
  console.log(`Middleware processing: ${request.method} ${request.nextUrl.pathname}`);
  
  // Make sure the x-forward-to-backend header is present for API requests
  if (isSuccessCasesRoute) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-forward-to-backend', '1');
    
    // Create a new request with the modified headers
    const modifiedRequest = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    return modifiedRequest;
  }
  
  return response;
}

// Configure the middleware to match specific paths
export const config = {
  matcher: [
    '/success-cases/:path*',
  ],
}; 