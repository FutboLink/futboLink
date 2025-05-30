import { NextResponse } from 'next/server';

export async function GET() {
  // Return an empty array of success cases
  return NextResponse.json({ successCases: [] });
} 