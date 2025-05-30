import { NextResponse } from 'next/server';

export async function GET() {
  // Return an empty array of videos
  return NextResponse.json({ videos: [] });
} 