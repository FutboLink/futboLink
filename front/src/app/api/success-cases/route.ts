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
    
    // Forward the request to the backend API with minimal options
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...request.headers.has('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}
      }
    });
    
    // Check if the response is ok
    if (!response.ok) {
      console.error(`Backend error (${response.status})`);
      return NextResponse.json(
        { error: 'Failed to fetch success cases' },
        { status: response.status }
      );
    }
    
    // Get the response data as JSON
    const data = await response.json();
    
    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in success-cases API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch success cases from backend' },
      { status: 500 }
    );
  }
} 