import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/Footer/footer';
import SocialButton from "@/components/SocialButton/SocialButton";
import Head from 'next/head';

// Define la interfaz para la noticia
interface INotice {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date?: string;
  author?: string;
  tags?: string[];
}

// URL del backend
const API_URL = 'https://futbolink.onrender.com';

export default function NewsViewer() {
  const router = useRouter();
  const { id } = router.query;

  const [notice, setNotice] = useState<INotice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo cargar datos cuando tengamos un ID válido
    if (!id || typeof id !== 'string') {
      return;
    }

    console.log('Cargando noticia con ID:', id);
    
    // Función para cargar la noticia directamente desde el backend
    const fetchNotice = async () => {
      try {
        // Crear URL al backend
        const url = `${API_URL}/News/${id}`;
        console.log('Realizando solicitud a:', url);
        
        // Realizar la solicitud
        const response = await fetch(url);
        
        console.log('Respuesta recibida:', response.status);
        
        if (!response.ok) {
          throw new Error(`Error al cargar la noticia: ${response.status}`);
        }
        
        // Convertir a JSON
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        // Actualizar estado
        setNotice(data);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };
    
    fetchNotice();
  }, [id]);

  // Formatear fecha si existe usando JavaScript nativo
  const formattedDate = notice?.date 
    ? new Date(notice.date).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;

  // Mostrar carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-verde-oscuro mx-auto"></div>
            <p className="mt-6 text-gray-600 font-medium">Cargando noticia...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center mt-24">
          <div className="max-w-md mx-auto">
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md mb-6">
              <div className="flex items-center mb-3">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="font-bold">Error al cargar la noticia</h3>
              </div>
              <p>{error}</p>
            </div>
            <Link href="/News" className="inline-flex items-center px-5 py-3 bg-verde-oscuro text-white rounded-lg hover:bg-verde-claro transition-colors shadow-md">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Volver a Noticias
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Mostrar "no encontrado" si no hay noticia
  if (!notice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center mt-24">
          <div className="max-w-md mx-auto">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg shadow-md mb-6">
              <div className="flex items-center mb-3">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <h3 className="font-bold">Noticia no encontrada</h3>
              </div>
              <p>No se encontró la noticia solicitada</p>
            </div>
            <Link href="/News" className="inline-flex items-center px-5 py-3 bg-verde-oscuro text-white rounded-lg hover:bg-verde-claro transition-colors shadow-md">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Volver a Noticias
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Renderizar la noticia con un diseño mejorado
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{notice.title} - FutboLink</title>
        <meta name="description" content={notice.description.substring(0, 160)} />
      </Head>
      
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Botón para volver */}
          <div className="max-w-4xl mx-auto mb-6">
            <Link href="/News" className="inline-flex items-center px-4 py-2 text-sm font-medium text-verde-oscuro border border-verde-oscuro bg-white rounded-lg hover:bg-verde-oscuro hover:text-white transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Volver a Noticias
            </Link>
          </div>
          
          {/* Contenido principal de la noticia */}
          <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Imagen destacada */}
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              <Image
                src={notice.imageUrl}
                alt={notice.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 800px, 1000px"
                priority
              />
            </div>
            
            {/* Contenido */}
            <div className="p-6 sm:p-8">
              {/* Metadata de la noticia */}
              <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
                {formattedDate && (
                  <div className="flex items-center mr-6 mb-2">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>{formattedDate}</span>
                  </div>
                )}
                
                {notice.author && (
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span>{notice.author}</span>
                  </div>
                )}
              </div>
              
              {/* Título */}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 leading-tight">{notice.title}</h1>
              
              {/* Tags */}
              {notice.tags && notice.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {notice.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-verde-oscuro text-xs font-medium rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Descripción */}
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {notice.description}
                </p>
              </div>
              
              {/* Compartir */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">Compartir esta noticia:</p>
                <div className="flex space-x-4">
                 
                  <button className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
      
      <SocialButton />
      <Footer />
    </div>
  );
} 