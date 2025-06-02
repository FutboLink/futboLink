"use client"; // Asegúrate de que este es un componente cliente

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const UserProfileRedirector = () => {
  const params = useParams(); // Obtiene el id de la URL
  const id = params?.id as string; // Convierte el id a string
  const router = useRouter();
  
  useEffect(() => {
    if (!id) return;
    
    // Redirigir a la nueva ruta basada en Pages Router
    console.log('Redirigiendo a la nueva ruta de visualización de usuario:', id);
    router.replace(`/user-viewer/${id}`);
  }, [id, router]);

  // Mostrar un mensaje de carga mientras se redirige
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-oscuro mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando perfil...</p>
      </div>
    </div>
  );
}  

export default UserProfileRedirector;
