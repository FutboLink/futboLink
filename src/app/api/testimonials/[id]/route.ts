import { NextRequest, NextResponse } from 'next/server';

// Import from the parent route to share the same data
// In a real app, this would use your database connection
import { testimonials as testimonialsStore } from '../route';

// Define the interface for testimonials
interface Testimonial {
  id: string;
  name: string;
  role: string;
  testimonial: string;
  imgUrl: string;
  longDescription?: string;
  createdAt: string;
  isPublished: boolean;
}

// Helper function to find a testimonial by ID
const getTestimonialById = (id: string): Testimonial | undefined => {
  return testimonialsStore.find((t) => t.id === id);
};

// GET handler to fetch a specific testimonial
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const testimonial = getTestimonialById(params.id);
  
  if (!testimonial) {
    return NextResponse.json(
      { message: 'Testimonial not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(testimonial);
}

// PUT handler to update a testimonial
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    const index = testimonialsStore.findIndex((t) => t.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { message: 'Testimonial not found' },
        { status: 404 }
      );
    }
    
    // Update the testimonial
    const updatedTestimonial = {
      ...testimonialsStore[index],
      name: data.name || testimonialsStore[index].name,
      role: data.role || testimonialsStore[index].role,
      testimonial: data.testimonial || testimonialsStore[index].testimonial,
      imgUrl: data.imgUrl || testimonialsStore[index].imgUrl,
      longDescription: data.longDescription !== undefined 
        ? data.longDescription 
        : testimonialsStore[index].longDescription,
      isPublished: data.isPublished !== undefined 
        ? data.isPublished 
        : testimonialsStore[index].isPublished
    };
    
    testimonialsStore[index] = updatedTestimonial;
    
    return NextResponse.json(updatedTestimonial);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { message: 'Error updating testimonial' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const index = testimonialsStore.findIndex((t) => t.id === params.id);
  
  if (index === -1) {
    return NextResponse.json(
      { message: 'Testimonial not found' },
      { status: 404 }
    );
  }
  
  testimonialsStore.splice(index, 1);
  
  return NextResponse.json(
    { message: 'Testimonial deleted successfully' }
  );
} 