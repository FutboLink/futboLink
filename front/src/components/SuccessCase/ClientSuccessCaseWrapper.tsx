'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation'; 

export default function ClientSuccessCaseWrapper() {
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    // Solo se ejecuta en el navegador
    if (typeof window === 'undefined') return;
    
    // Comprobar si estamos en una página de casos de éxito con la ruta antigua
    if (pathname?.startsWith('/casos-de-exito/')) {
      try {
        // Extraer el ID del caso de la URL
        const segments = pathname.split('/');
        const id = segments[segments.length - 1];
        if (id) {
          console.log('Redirigiendo caso de éxito con ID:', id);
          // Redirigir a la nueva ruta
          router.replace(`/success-case-viewer/${id}`);
        }
      } catch (error) {
        console.error('Error al extraer el ID del caso:', error);
      }
    }
  }, [pathname, router]);
  
  // Este componente no renderiza nada, solo redirige
  return null;
} 