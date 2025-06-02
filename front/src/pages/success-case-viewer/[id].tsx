import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/Footer/footer';
import SocialButton from "@/components/SocialButton/SocialButton";
import Head from 'next/head';

// Define la interfaz para el caso de éxito
interface ISuccessCase {
  id?: string;
  name: string;
  role: string;
  testimonial: string;
  imgUrl: string;
  longDescription?: string;
  createdAt?: string;
  isPublished?: boolean;
}

// URL del backend
const API_URL = 'https://futbolink.onrender.com';

export default function SuccessCaseViewer() {
  const router = useRouter();
  const { id } = router.query;

  const [successCase, setSuccessCase] = useState<ISuccessCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  
  // Imagen de respaldo
  const fallbackImage = 'https://dummyimage.com/800x600/1d5126/ffffff&text=FutboLink';

  useEffect(() => {
    // Solo cargar datos cuando tengamos un ID válido
    if (!id || typeof id !== 'string') {
      return;
    }

    console.log('Cargando caso de éxito con ID:', id);
    
    // Función para cargar el caso de éxito directamente desde el backend
    const fetchSuccessCase = async () => {
      try {
        // Crear URL al backend
        const url = `${API_URL}/success-cases/${id}`;
        console.log('Realizando solicitud a:', url);
        
        // Realizar la solicitud sin headers personalizados que causan problemas CORS
        const response = await fetch(url);
        
        console.log('Respuesta recibida:', response.status);
        
        if (!response.ok) {
          throw new Error(`Error al cargar el caso de éxito: ${response.status}`);
        }
        
        // Convertir a JSON
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        // Actualizar estado
        setSuccessCase(data);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };
    
    fetchSuccessCase();
  }, [id]);

  // Manejador de errores de carga de imagen
  const handleImageError = () => {
    console.log('Error al cargar la imagen, usando imagen de respaldo');
    setImageError(true);
  };

  // Determinar la URL de la imagen a mostrar
  const imgUrl = imageError || !successCase?.imgUrl ? fallbackImage : successCase.imgUrl;

  // Mostrar carga
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-oscuro mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando caso de éxito...</p>
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
          <Link href="/#casos-de-exito" className="inline-block px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-verde-claro transition-colors">
            Volver a casos de éxito
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Mostrar "no encontrado" si no hay caso de éxito
  if (!successCase) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center mt-20">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>No se encontró el caso de éxito solicitado</p>
          </div>
          <Link href="/#casos-de-exito" className="inline-block px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-verde-claro transition-colors">
            Volver a casos de éxito
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Renderizar el caso de éxito
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{successCase.name} - FutboLink</title>
        <meta name="description" content={successCase.testimonial.substring(0, 160)} />
      </Head>
      
      <Navbar />
      
      <main className="bg-gray-50">
        {/* Cabecera con imagen de fondo */}
        <div className="relative h-[300px] md:h-[400px] bg-gray-800">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ 
              backgroundImage: `url(${imgUrl})`,
              backgroundPosition: 'center 25%',
              backgroundSize: 'cover',
              filter: 'blur(2px)',
              opacity: 0.8
            }}
          ></div>
          <div className="container relative mx-auto px-4 h-full flex flex-col justify-end pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {successCase.name}
            </h1>
            <p className="text-xl text-white mb-4 drop-shadow-md">
              {successCase.role}
            </p>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
            {/* Imagen perfil */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="md:w-1/3">
                <div className="overflow-hidden rounded-lg shadow-md">
                  <img 
                    src={imgUrl}
                    alt={successCase.name}
                    className="w-full h-auto object-cover"
                    onError={handleImageError}
                  />
                </div>
              </div>
              
              <div className="md:w-2/3">
                <blockquote className="text-xl italic text-gray-700 border-l-4 border-verde-oscuro pl-4 py-2 mb-6">
                  "{successCase.testimonial}"
                </blockquote>
                
                <div className="flex items-center mt-4">
                  <div className="h-1 w-16 bg-verde-oscuro mr-3"></div>
                  <span className="text-sm text-gray-600 uppercase">Historia de éxito</span>
                </div>
              </div>
            </div>
            
            {/* Contenido detallado */}
            <div className="prose prose-lg max-w-none">
              {successCase.longDescription ? (
                <div className="mt-6">
                  {successCase.longDescription.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <h2 className="text-2xl font-semibold text-verde-oscuro mb-4">
                    De nuestros testimonios a tu historia
                  </h2>
                  <p className="mb-4 text-gray-700 leading-relaxed">
                    {successCase.name} es uno de los muchos talentos que han encontrado su camino 
                    gracias a FutboLink, la plataforma que conecta profesionales del fútbol con 
                    oportunidades reales en todo el mundo.
                  </p>
                  <p className="mb-4 text-gray-700 leading-relaxed">
                    Su experiencia muestra cómo FutboLink puede ser el puente entre tus sueños y 
                    una carrera exitosa en el ámbito futbolístico, ya sea como jugador, entrenador 
                    o cualquier rol relacionado con este deporte.
                  </p>
                  <p className="mb-4 text-gray-700 leading-relaxed">
                    Únete a nuestra comunidad y forma parte de las próximas historias de éxito.
                  </p>
                </div>
              )}
            </div>
            
            {/* Enlaces para volver y suscribirse */}
            <div className="mt-12 flex justify-between items-center">
              <Link 
                href="/#casos-de-exito" 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a casos de éxito
              </Link>
              <Link 
                href="/Subs" 
                className="px-4 py-2 bg-verde-oscuro text-white rounded-md hover:bg-verde-claro transition-colors"
              >
                ¿Quieres ser el próximo?
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <SocialButton />
      <Footer />
    </div>
  );
} 