import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Parse the URL to get any query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    // Return an empty array with pagination metadata
    return NextResponse.json({
      news: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
} 