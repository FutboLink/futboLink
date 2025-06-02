"use client"; // Asegúrate de que este es un componente cliente

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewsRedirector() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  useEffect(() => {
    if (!id) return;
    
    // Redirigir a la nueva ruta basada en Pages Router
    console.log('Redirigiendo a la nueva ruta de visualización de noticia:', id);
    router.replace(`/news-detail/${id}`);
  }, [id, router]);

  // Mostrar un mensaje de carga mientras se redirige
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-oscuro mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando noticia...</p>
      </div>
    </div>
  );
}
