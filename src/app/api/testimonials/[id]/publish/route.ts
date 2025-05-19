import { NextRequest, NextResponse } from 'next/server';
import { testimonials } from '../../route';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { isPublished } = data;
    
    if (isPublished === undefined) {
      return NextResponse.json(
        { message: 'isPublished field is required' },
        { status: 400 }
      );
    }
    
    const index = testimonials.findIndex((t) => t.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Testimonial not found' },
        { status: 404 }
      );
    }
    
    // Update only the isPublished status
    const updatedTestimonial = {
      ...testimonials[index],
      isPublished
    };
    
    testimonials[index] = updatedTestimonial;
    
    return NextResponse.json(updatedTestimonial);
  } catch (error) {
    console.error('Error updating publish status:', error);
    return NextResponse.json(
      { message: 'Error updating publish status' },
      { status: 500 }
    );
  }
} 