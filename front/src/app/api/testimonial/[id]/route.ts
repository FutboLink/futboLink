import { NextResponse } from 'next/server';
import { ISuccessCase } from '@/Interfaces/ISuccessCase';
import { testimonials } from '../route';

// GET a single testimonial by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  const testimonial = testimonials.find(t => t.id === id);
  
  if (!testimonial) {
    return NextResponse.json(
      { message: 'Testimonio no encontrado' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(testimonial);
}

// UPDATE a testimonial by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    // Find testimonial index
    const index = testimonials.findIndex(t => t.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Testimonio no encontrado' },
        { status: 404 }
      );
    }
    
    // Update testimonial with new data while preserving the ID
    testimonials[index] = {
      ...testimonials[index],
      ...data,
      id // Make sure ID doesn't change
    };
    
    return NextResponse.json(testimonials[index]);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE a testimonial by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  // Find testimonial index
  const index = testimonials.findIndex(t => t.id === id);
  
  if (index === -1) {
    return NextResponse.json(
      { message: 'Testimonio no encontrado' },
      { status: 404 }
    );
  }
  
  // Remove testimonial from array
  testimonials.splice(index, 1);
  
  return NextResponse.json({ success: true });
} 