import { useRouter } from 'next/router';
import { useEffect, useState, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/Footer/footer';
import SocialButton from "@/components/SocialButton/SocialButton";
import Head from 'next/head';
import CardProfile from '@/components/Jobs/CardProfile';
import { IProfileData } from '@/Interfaces/IUser';
import { UserContext } from '@/components/Context/UserContext';

// URL del backend
const API_URL = 'https://futbolink.onrender.com';

// Función para convertir el rol a un texto más amigable
const getRoleDisplay = (role: string) => {
  const roleMap: {[key: string]: string} = {
    'PLAYER': 'Jugador',
    'COACH': 'Entrenador',
    'RECRUITER': 'Reclutador',
    'ADMIN': 'Administrador'
  };
  return roleMap[role] || role;
};

export default function UserViewer() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token, role } = useContext(UserContext);

  const [profile, setProfile] = useState<IProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationSent, setNotificationSent] = useState(false);
  
  // Función para enviar notificación de visualización de perfil
  const sendProfileViewNotification = async (viewedUserId: string) => {
    try {
      // Solo enviar la notificación si el usuario está autenticado y es un ofertante
      if (!token || !user || !['RECRUITER', 'ADMIN'].includes(role || '')) {
        console.log('No se envía notificación: usuario no autenticado o no es ofertante');
        return;
      }
      
      // No enviar notificación si el usuario está viendo su propio perfil
      if (user.id === viewedUserId) {
        console.log('No se envía notificación: usuario viendo su propio perfil');
        return;
      }
      
      // Enviar la notificación al backend
      const response = await fetch(`${API_URL}/notifications/profile-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ viewedUserId })
      });
      
      if (response.ok) {
        console.log('Notificación de visualización de perfil enviada correctamente');
        setNotificationSent(true);
      } else {
        console.error('Error al enviar la notificación:', await response.text());
      }
    } catch (err) {
      console.error('Error al enviar la notificación:', err);
    }
  };
  
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
        
        // Guardar el tipo de suscripción para el sidebar
        data.subscriptionType = data.subscriptionType || 'Amateur';
        
        // Asignar el rol del usuario al campo puesto para mostrar en CardProfile
        if (data.role) {
          data.puesto = getRoleDisplay(data.role);
        } else if (data.posicion) {
          // Si tiene una posición específica (para jugadores), usar esa
          data.puesto = data.posicion;
        }
        
        // Actualizar estado
        setProfile(data);
        setLoading(false);
        
        // Enviar notificación de visualización de perfil
        if (!notificationSent) {
          sendProfileViewNotification(id);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [id, token, notificationSent, user, role]);

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