import { NextResponse } from 'next/server';

// Simple route that just returns a 307 redirect to the page-based solution
export function GET() {
  return NextResponse.redirect(new URL('/news-detail', 'https://futbolink.vercel.app'));
} 