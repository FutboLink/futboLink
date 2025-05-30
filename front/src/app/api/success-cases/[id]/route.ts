import { NextRequest, NextResponse } from 'next/server';

// Get the API URL from environment variables with a fallback
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://futbolink.onrender.com';

interface SuccessCaseParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: SuccessCaseParams
) {
  try {
    const id = params.id;
    console.log(`Proxying request to ${apiUrl}/success-cases/${id}`);
    
    // Forward the request to the backend
    const response = await fetch(`${apiUrl}/success-cases/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Backend returned error: ${response.status}`);
      // Return proper error response
      return NextResponse.json(
        { message: `Cannot GET /success-cases/${id}`, error: 'Not Found' },
        { status: response.status }
      );
    }

    // Parse the JSON response from the backend
    const data = await response.json();
    
    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying success-cases request:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: String(error) },
      { status: 500 }
    );
  }
} 