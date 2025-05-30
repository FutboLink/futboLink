import { NextResponse } from 'next/server';

// Get the API URL from environment variables with a fallback
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://futbolink.onrender.com';

export async function POST(request: Request) {
  try {
    console.log(`Proxying login request to ${apiUrl}/login`);
    
    // Get the request body
    const body = await request.json();
    
    // Forward the request to the backend
    const response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Backend returned error: ${response.status}`);
      
      // Return proper error response
      return NextResponse.json(
        { message: 'Error en la autenticación' },
        { status: response.status }
      );
    }

    // Parse the JSON response from the backend
    const data = await response.json();
    
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