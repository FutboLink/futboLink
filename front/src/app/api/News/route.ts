import { NextResponse } from 'next/server';

// Get the API URL from environment variables with a fallback
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://futbolink.onrender.com';

export async function GET(request: Request) {
  try {
    // Get any query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    
    // Construct the URL with query parameters if they exist
    const url = page 
      ? `${apiUrl}/News?page=${page}` 
      : `${apiUrl}/News`;
    
    console.log(`Proxying request to ${url}`);
    
    // Forward the request to the backend
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Backend returned error: ${response.status}`);
      // Return proper error response
      return NextResponse.json(
        { message: `Cannot GET /News`, error: 'Not Found' },
        { status: response.status }
      );
    }

    // Parse the JSON response from the backend
    const data = await response.json();
    
    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying News request:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log(`Proxying POST request to ${apiUrl}/News`);
    
    // Get the request body
    const body = await request.json();
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    
    // Forward the request to the backend
    const response = await fetch(`${apiUrl}/News`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Backend returned error: ${response.status}`);
      // Return proper error response
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { message: `Error creating news`, error: 'Backend Error' },
        { status: response.status }
      );
    }

    // Parse the JSON response from the backend
    const data = await response.json();
    
    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying News POST request:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: String(error) },
      { status: 500 }
    );
  }
} 