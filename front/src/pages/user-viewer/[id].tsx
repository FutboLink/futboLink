import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/Footer/footer';
import SocialButton from "@/components/SocialButton/SocialButton";
import Head from 'next/head';
import CardProfile from '@/components/Jobs/CardProfile';
import { IProfileData } from '@/Interfaces/IUser';

// URL del backend
const API_URL = 'https://futbolink.onrender.com';

export default function UserViewer() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState<IProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Solo cargar datos cuando tengamos un ID válido
    if (!id || typeof id !== 'string') {
      return;
    }

    console.log('Cargando perfil de usuario con ID:', id);
    
    // Función para cargar el perfil directamente desde el backend
    const fetchUserProfile = async () => {
      try {
        // Crear URL al backend
        const url = `${API_URL}/user/${id}`;
        console.log('Realizando solicitud a:', url);
        
        // Realizar la solicitud sin headers problemáticos
        const response = await fetch(url);
        
        console.log('Respuesta recibida:', response.status);
        
        if (!response.ok) {
          throw new Error(`Error al cargar el perfil: ${response.status}`);
        }
        
        // Convertir a JSON
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        // Asegurarnos de que el tipo de suscripción se refleje en el campo puesto
        // para mantener compatibilidad con el componente CardProfile
        if (data.subscriptionType) {
          data.puesto = data.subscriptionType;
        }
        
        // Actualizar estado
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [id]);

  // Mostrar carga
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-oscuro mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando perfil de usuario...</p>
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
          <Link href="/jobs" className="inline-block px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-verde-claro transition-colors">
            Volver a ofertas
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Mostrar "no encontrado" si no hay perfil
  if (!profile) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center mt-20">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>No se encontró el perfil solicitado</p>
          </div>
          <Link href="/jobs" className="inline-block px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-verde-claro transition-colors">
            Volver a ofertas
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Renderizar el perfil
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{profile.name} {profile.lastname} - FutboLink</title>
        <meta name="description" content={`Perfil de ${profile.name} ${profile.lastname} - ${profile.puesto || ''}`} />
      </Head>
      
      <Navbar />
      
      <div className="mt-16 mb-10">
        <CardProfile profile={profile} />
      </div>
      
      <SocialButton />
      <Footer />
    </div>
  );
} 