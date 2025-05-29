import { NextRequest, NextResponse } from 'next/server';

// Define the API handler for published success-cases
export async function GET(request: NextRequest) {
  try {
    console.log('API route handler for /api/success-cases/published');
    
    // Determine the backend URL based on environment
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://futbolink.onrender.com';
    
    const apiUrl = `${baseUrl}/success-cases/published`;
    console.log(`Forwarding request to backend at: ${apiUrl}`);
    
    // Forward the request to the backend API with minimal options
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Check if the response is ok
    if (!response.ok) {
      console.error(`Backend error (${response.status})`);
      return NextResponse.json(
        { error: 'Failed to fetch published success cases' },
        { status: response.status }
      );
    }
    
    // Get the response data as JSON
    const data = await response.json();
    
    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in success-cases/published API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch published success cases from backend' },
      { status: 500 }
    );
  }
} 