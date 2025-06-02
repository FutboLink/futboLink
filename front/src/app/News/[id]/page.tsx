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
    
    // Usamos push en lugar de replace para asegurar que el navegador cargue la nueva página
    router.push(`/news-detail/${id}`);
  }, [id, router]);

  // Mostrar un mensaje de carga mientras se redirige
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-oscuro mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando noticia...</p>
        <button 
          onClick={() => window.location.href = `/news-detail/${id}`}
          className="mt-4 px-4 py-2 bg-verde-oscuro text-white rounded hover:bg-verde-claro transition-colors"
        >
          Continuar a la noticia
        </button>
      </div>
    </div>
  );
}
