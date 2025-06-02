import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/Footer/footer';
import SocialButton from '@/components/SocialButton/SocialButton';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  content?: string;
  author?: string;
}

// URL del backend
const API_URL = 'https://futbolink.onrender.com';

export default function NewsDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Solo cargar datos cuando tengamos un ID válido
    if (!id || typeof id !== 'string') {
      return;
    }

    console.log('Cargando noticia con ID:', id);
    
    // Función para cargar la noticia directamente desde el backend
    const fetchNewsItem = async () => {
      try {
        // Crear URL al backend
        const url = `${API_URL}/News/${id}`;
        console.log('Realizando solicitud a:', url);
        
        // Realizar la solicitud sin headers problemáticos
        const response = await fetch(url);
        
        console.log('Respuesta recibida:', response.status);
        
        if (!response.ok) {
          throw new Error(`Error al cargar la noticia: ${response.status}`);
        }
        
        // Convertir a JSON
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        // Actualizar estado
        setNewsItem(data);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };
    
    fetchNewsItem();
  }, [id]);

  // Mostrar carga
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-oscuro mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando noticia...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center mt-20">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
          <Link href="/noticias" className="inline-block px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-verde-claro transition-colors">
            Volver a noticias
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Mostrar "no encontrado" si no hay noticia
  if (!newsItem) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center mt-20">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>No se encontró la noticia solicitada</p>
          </div>
          <Link href="/noticias" className="inline-block px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-verde-claro transition-colors">
            Volver a noticias
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Renderizar la noticia
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{newsItem.title} - FutboLink</title>
        <meta name="description" content={newsItem.description} />
      </Head>
      
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {newsItem.imageUrl && (
            <div className="relative w-full h-96">
              <Image 
                src={newsItem.imageUrl} 
                alt={newsItem.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{newsItem.title}</h1>
            
            {newsItem.date && (
              <p className="text-sm text-gray-600 mb-4">
                {new Date(newsItem.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
            
            {newsItem.author && (
              <p className="text-sm text-gray-600 mb-6">
                Por: {newsItem.author}
              </p>
            )}
            
            <div className="prose max-w-none">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">{newsItem.description}</p>
              
              {newsItem.content && (
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: newsItem.content }}
                />
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link 
                href="/noticias" 
                className="inline-block px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-verde-claro transition-colors"
              >
                Volver a noticias
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <SocialButton />
      <Footer />
    </div>
  );
} 