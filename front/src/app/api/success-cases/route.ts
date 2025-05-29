import { NextRequest, NextResponse } from 'next/server';

// Define the API handler for success-cases
export async function GET(request: NextRequest) {
  try {
    console.log('API route handler for /api/success-cases');
    
    // Determine the backend URL based on environment
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://futbolink.onrender.com';
    
    const apiUrl = `${baseUrl}/success-cases`;
    console.log(`Forwarding request to backend at: ${apiUrl}`);
    
    // Forward the request to the backend API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward any authorization headers from the original request
        ...request.headers.has('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}
      },
    });
    
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
    console.error('Error in success-cases API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch success cases from backend' },
      { status: 500 }
    );
  }
} 