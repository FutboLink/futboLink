import { NextResponse } from 'next/server';
import { testimonials } from '../testimonial/route';

// GET all testimonials - redirects to the singular endpoint
export async function GET() {
  return NextResponse.json(testimonials);
}

// POST a new testimonial - calls the singular endpoint handler
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Forward to the existing implementation
    const response = await fetch(new URL('/api/testimonial', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response;
  } catch (error) {
    console.error('Error forwarding to testimonial endpoint:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 