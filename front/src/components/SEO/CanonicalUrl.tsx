'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

type CanonicalUrlProps = {
  // URL base del sitio, por defecto será la del dominio principal
  baseUrl?: string;
};

/**
 * Componente que agrega la etiqueta canonical a las páginas
 * Soluciona el problema de contenido duplicado para SEO
 */
export default function CanonicalUrl({ baseUrl = 'https://futbolink.com' }: CanonicalUrlProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Eliminar etiquetas canónicas existentes para evitar duplicados
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Crear la URL canónica completa
    const canonicalUrl = `${baseUrl}${pathname}`;
    
    // Crear y añadir la etiqueta canonical
    const linkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'canonical');
    linkElement.setAttribute('href', canonicalUrl);
    document.head.appendChild(linkElement);

    // Limpiar al desmontar el componente
    return () => {
      const canonicalTag = document.querySelector('link[rel="canonical"]');
      if (canonicalTag) {
        canonicalTag.remove();
      }
    };
  }, [pathname, baseUrl]);

  // Este componente no renderiza nada visible
  return null;
} 