import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return an empty array of videos
    return NextResponse.json({ 
      videos: [],
      success: true
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos", success: false },
      { status: 500 }
    );
  }
} 