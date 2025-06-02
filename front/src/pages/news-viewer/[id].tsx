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
          <Link href="/News" className="inline-block px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-verde-claro transition-colors">
            Volver a Noticias
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Mostrar "no encontrado" si no hay noticia
  if (!notice) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center mt-20">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>No se encontró la noticia solicitada</p>
          </div>
          <Link href="/News" className="inline-block px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-verde-claro transition-colors">
            Volver a Noticias
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Renderizar la noticia con Tailwind directamente
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{notice.title} - FutboLink</title>
        <meta name="description" content={notice.description.substring(0, 160)} />
      </Head>
      
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-20 mb-10">
        <div className="max-w-4xl mx-auto">
          {/* Botón para volver */}
          <Link href="/News" className="inline-block px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-verde-claro transition-colors mb-6">
            ← Volver a Noticias
          </Link>
          
          {/* Contenido principal de la noticia */}
          <article className="bg-white  rounded-lg overflow-hidden">
            {/* Título de la noticia */}
            <h1 className="text-3xl font-bold text-gray-800 p-6 pb-4">{notice.title}</h1>
            
            {/* Imagen destacada - Nuevo diseño para mostrar la imagen completa */}
            <div className="w-full px-6 pb-6">
              <div className="w-full overflow-hidden rounded-lg">
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
              </div>
            </div>
            
            {/* Descripción completa */}
            <div className="p-6 pt-0">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {notice.description}
              </p>
            </div>
          </article>
        </div>
      </div>
      
      <SocialButton />
      <Footer />
    </div>
  );
} 