"use client";

import PanelManager from '@/components/Panel/Manager/manager';
import { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/components/Context/UserContext';

export default function ManagerPanel() {
  const router = useRouter();
  const { isLogged, token } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un token en localStorage directamente
    const userDataStr = localStorage.getItem("user");
    const hasLocalToken = userDataStr ? JSON.parse(userDataStr)?.token : null;
    
    // Esperar un momento para que el contexto se inicialice
    const timer = setTimeout(() => {
      if (!isLogged && !hasLocalToken) {
        console.log("No hay sesión activa, redirigiendo a login");
        router.push('/Login');
      } else {
        console.log("Sesión detectada, mostrando panel");
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isLogged, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de gestión...</p>
        </div>
      </div>
    );
  }

  // Cargar directamente el componente PanelManager
  return <PanelManager />;
}
