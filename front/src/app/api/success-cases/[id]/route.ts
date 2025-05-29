import { NextRequest, NextResponse } from 'next/server';

// Define the API handler for individual success-cases
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    console.log(`API route handler for /api/success-cases/${id}`);
    
    // Determine the backend URL based on environment
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://futbolink.onrender.com';
    
    const apiUrl = `${baseUrl}/success-cases/${id}`;
    console.log(`Forwarding request to backend at: ${apiUrl}`);
    
    // Forward the request to the backend API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        // Forward any authorization headers from the original request
        ...request.headers.has('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `Failed to fetch success case with ID: ${id}` },
        { status: response.status }
      );
    }
    
    // Get the response data as JSON
    const data = await response.json();
    
    // Return the data with proper headers
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error(`Error in success-cases/${id} API route:`, error);
    return NextResponse.json(
      { error: `Failed to fetch success case with ID: ${id}` },
      { status: 500 }
    );
  }
} 