import { NextResponse } from 'next/server';

// GET handler - forwards to singular endpoint
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  // Forward to singular endpoint
  const response = await fetch(new URL(`/api/testimonial/${id}`, request.url));
  return response;
}

// PUT handler - forwards to singular endpoint
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await request.text(); // Get body as text to pass along
  
  // Forward to singular endpoint
  const response = await fetch(new URL(`/api/testimonial/${id}`, request.url), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body
  });
  
  return response;
}

// DELETE handler - forwards to singular endpoint
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Forward to singular endpoint
  const response = await fetch(new URL(`/api/testimonial/${id}`, request.url), {
    method: 'DELETE'
  });
  
  return response;
} 