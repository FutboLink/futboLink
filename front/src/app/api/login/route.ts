import { NextResponse } from 'next/server';

// Get the API URL from environment variables with a fallback
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://futbolink.onrender.com';

export async function POST(request: Request) {
  try {
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
      },
      body: JSON.stringify(body),
    });

    // Log response status and headers for debugging
    console.log(`Backend response status: ${response.status}`);
    const responseHeaders = Object.fromEntries(response.headers.entries());
    console.log('Backend response headers:', JSON.stringify(responseHeaders, null, 2));

    if (!response.ok) {
      let errorData = { message: 'Error en la autenticación' };
      
      try {
        // Try to get more detailed error info from response
        const errorJson = await response.json();
        console.error(`Backend returned error: ${response.status}`, errorJson);
        errorData = errorJson;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }
      
      // Return proper error response with the original status code
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }

    // Parse the JSON response from the backend
    const data = await response.json();
    console.log('Login successful, returning token');
    
    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying login request:', error);
    return NextResponse.json(
      { message: 'Error en la autenticación', error: String(error) },
      { status: 500 }
    );
  }
} 