import { NextResponse } from 'next/server';

// Get the API URL from environment variables with a fallback
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://futbolink.onrender.com';

export async function POST(request: Request) {
  try {
    // Log request origin and URL for debugging
    console.log(`Login request from: ${request.headers.get('origin') || 'unknown origin'}`);
    console.log(`Proxying login request to ${apiUrl}/login`);
    
    // Get the request body
    const body = await request.json();
    console.log('Login request body:', JSON.stringify(body, null, 2).substring(0, 100) + '...');
    
    // Forward the request to the backend
    const response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://www.futbolink.it', // Explicitly set origin for CORS
      },
      body: JSON.stringify(body),
      credentials: 'include', // Include credentials
    });

    // Log response status and headers for debugging
    console.log(`Backend response status: ${response.status}`);
    const responseHeaders = Object.fromEntries(response.headers.entries());
    console.log('Backend response headers:', JSON.stringify(responseHeaders, null, 2));

    if (!response.ok) {
      let errorData = { message: 'Error en la autenticación' };
      let responseText = '';
      
      try {
        // Try to get response as text first
        responseText = await response.text();
        console.log('Backend error response as text:', responseText);
        
        // Then try to parse as JSON if possible
        if (responseText && responseText.trim().startsWith('{')) {
          const errorJson = JSON.parse(responseText);
          console.error(`Backend returned error: ${response.status}`, errorJson);
          errorData = errorJson;
        }
      } catch (parseError) {
        console.error('Could not parse error response:', parseError, 'Raw response:', responseText);
      }
      
      // Return proper error response with the original status code
      return new NextResponse(
        JSON.stringify(errorData),
        { 
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Parse the JSON response from the backend
    const data = await response.json();
    console.log('Login successful, returning token');
    
    // Return the data with proper CORS headers
    return new NextResponse(
      JSON.stringify(data),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  } catch (error) {
    console.error('Error proxying login request:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Error en la autenticación', error: String(error) }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
} 