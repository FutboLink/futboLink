import { NextResponse } from 'next/server';
import { ISuccessCase } from '@/Interfaces/ISuccessCase';

// In-memory storage for testimonials
// This is lost on server restart, but works for development
export let testimonials: ISuccessCase[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    role: 'Jugador Profesional, 24 años - Argentina',
    testimonial: 'Gracias a FutboLink pude conectar con un club europeo y cumplir mi sueño de jugar en el extranjero.',
    imgUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c29jY2VyJTIwcGxheWVyfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    longDescription: 'Mi experiencia con FutboLink fue increíble. Después de años jugando en ligas menores en Argentina, estaba buscando una oportunidad para dar el salto a Europa. A través de la plataforma, pude crear un perfil profesional con todos mis datos, estadísticas y videos destacados. Un ojeador de un club español vio mi perfil y me contactó para una prueba. Hoy estoy jugando en Segunda División y cumpliendo mi sueño.',
    createdAt: new Date().toISOString(),
    isPublished: true
  },
  {
    id: '2',
    name: 'María González',
    role: 'Entrenadora, 35 años - México',
    testimonial: 'FutboLink me permitió encontrar oportunidades laborales en el extranjero que no hubiera descubierto por otros medios.',
    imgUrl: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNvY2NlciUyMGNvYWNofGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    longDescription: 'Como entrenadora con licencia UEFA B pero sin contactos internacionales, FutboLink me abrió puertas que parecían inalcanzables. Gracias a la plataforma, pude aplicar a ofertas en diferentes países y finalmente conseguí un puesto como entrenadora asistente en un equipo femenino en Estados Unidos. La visibilidad que me dio la plataforma fue fundamental para mi desarrollo profesional.',
    createdAt: new Date().toISOString(),
    isPublished: true
  }
];

// GET handler for /api/testimonial
export async function GET() {
  return NextResponse.json(testimonials);
}

// POST handler for /api/testimonial
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.role || !data.testimonial || !data.imgUrl) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }
    
    // Create new testimonial
    const newTestimonial: ISuccessCase = {
      id: Date.now().toString(), // Simple ID generation
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
      { message: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
} 