'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

type StructuredDataProps = {
  baseUrl?: string;
  siteName?: string;
  logoUrl?: string;
};

/**
 * Componente para añadir datos estructurados (schema.org) a la página
 * Mejora el SEO y permite que los motores de búsqueda entiendan mejor el contenido
 */
export default function StructuredData({
  baseUrl = 'https://futbolink.com',
  siteName = 'Futbolink',
  logoUrl = 'https://futbolink.com/logoD.png'
}: StructuredDataProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Eliminar scripts de datos estructurados existentes
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Crear y añadir los datos estructurados
    const url = `${baseUrl}${pathname}`;
    
    // Datos estructurados de la organización/sitio web
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: baseUrl,
      logo: logoUrl,
      sameAs: [
        'https://twitter.com/futbolink',
        'https://www.facebook.com/futbolink',
        'https://www.instagram.com/futbolink',
        'https://www.linkedin.com/company/futbolink'
      ]
    };

    // Datos estructurados para la página actual (WebPage)
    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      url: url,
      name: document.title || siteName,
      isPartOf: {
        '@type': 'WebSite',
        name: siteName,
        url: baseUrl
      }
    };

    // Añadir los datos estructurados
    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.textContent = JSON.stringify(organizationSchema);
    document.head.appendChild(orgScript);

    const pageScript = document.createElement('script');
    pageScript.type = 'application/ld+json';
    pageScript.textContent = JSON.stringify(webPageSchema);
    document.head.appendChild(pageScript);

    // Limpiar al desmontar
    return () => {
      document.querySelectorAll('script[type="application/ld+json"]').forEach(script => script.remove());
    };
  }, [pathname, baseUrl, siteName, logoUrl]);

  // No renderiza nada visible
  return null;
} 