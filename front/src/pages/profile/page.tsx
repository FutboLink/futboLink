"use client";

import { useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/components/Context/UserContext';

export default function ProfileRedirect() {
  const router = useRouter();
  const { user, isLogged } = useContext(UserContext);

  useEffect(() => {
    if (isLogged && user && user.id) {
      // Redirigir al perfil del usuario
      router.push(`/user/${user.id}`);
    } else if (!isLogged) {
      // Si no está logueado, redirigir a inicio de sesión
      router.push('/Login');
    } else {
      // Si está logueado pero no tiene ID, ir a la página de inicio
      router.push('/');
    }
  }, [isLogged, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo a tu perfil...</p>
      </div>
    </div>
  );
} 