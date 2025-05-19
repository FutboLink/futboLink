import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for testimonials since we don't have a backend database
// In a real app, this would use your actual database
export let testimonials = [
  {
    id: '1',
    name: 'Juan Pérez',
    role: 'Jugador de Fútbol, 24 años — Argentina',
    testimonial: 'FutboLink me ayudó a encontrar mi primer contrato profesional. Estoy muy agradecido por la oportunidad.',
    imgUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop',
    longDescription: 'Después de años jugando en categorías inferiores, FutboLink me permitió conectar con un club que buscaba exactamente mis características. El proceso fue rápido y transparente.',
    createdAt: new Date().toISOString(),
    isPublished: true
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    role: 'Entrenador — España',
    testimonial: 'Como entrenador, poder acceder a perfiles verificados de jugadores ha sido fundamental para armar mi equipo.',
    imgUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
    longDescription: 'La plataforma me permitió filtrar jugadores según las necesidades específicas de mi equipo. Encontré talento que de otra forma hubiera pasado desapercibido.',
    createdAt: new Date().toISOString(),
    isPublished: true
  }
];

// GET handler to fetch all testimonials
export async function GET(request: NextRequest) {
  return NextResponse.json(testimonials);
}

// POST handler to create a new testimonial
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.role || !data.testimonial || !data.imgUrl) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create new testimonial
    const newTestimonial = {
      id: uuidv4(),
      name: data.name,
      role: data.role,
      testimonial: data.testimonial,
      imgUrl: data.imgUrl,
      longDescription: data.longDescription || '',
      createdAt: new Date().toISOString(),
      isPublished: data.isPublished !== false
    };
    
    // Add to collection
    testimonials.push(newTestimonial);
    
    return NextResponse.json(newTestimonial, { status: 201 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { message: 'Error creating testimonial' },
      { status: 500 }
    );
  }
} 