/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'res.cloudinary.com',  // Dominio principal de Cloudinary
      'cloudinary.com',      // Dominio alternativo
      'api.cloudinary.com',  // API de Cloudinary
      'img.freepik.com',     // Freepik para imágenes
      'dummyimage.com',      // Servicio de imágenes de marcador de posición
    ],
    // Permitir que las imágenes se carguen sin optimización cuando sea necesario
    unoptimized: process.env.NODE_ENV === 'production',
    // Configuración de remotePatterns para imágenes externas
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.freepik.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
        pathname: '/**',
      },
    ],
  },
  // Otras configuraciones existentes
  async rewrites() {
    const rewrites = [];
    
    // Ruta base de la API
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://futbolink.onrender.com';
    
    console.log('Next.js rewrite configuration using baseUrl:', baseUrl);
    
    // Redirección para API general
    rewrites.push({
      source: '/api/:path*',
      destination: `${baseUrl}/api/:path*`,
    });
    
    // Redirección específica para el endpoint de contacto
    rewrites.push({
      source: '/email/contact',
      destination: `${baseUrl}/email/contact`,
    });
    
    // Redirección específica para las opciones CORS
    rewrites.push({
      source: '/email/:path*',
      destination: `${baseUrl}/email/:path*`,
    });
    
    // Add rewrites for other specific endpoints that are failing
    rewrites.push({
      source: '/News',
      destination: `${baseUrl}/News`,
    });
    
    rewrites.push({
      source: '/News/:path*',
      destination: `${baseUrl}/News/:path*`,
    });
    
    rewrites.push({
      source: '/success-cases',
      destination: `${baseUrl}/success-cases`,
    });
    
    rewrites.push({
      source: '/success-cases/:path*',
      destination: `${baseUrl}/success-cases/:path*`,
    });
    
    rewrites.push({
      source: '/contact',
      destination: `${baseUrl}/contact`,
    });
    
    // Catch-all rewrite for any backend routes
    rewrites.push({
      source: '/:path*',
      has: [
        {
          type: 'header',
          key: 'x-forward-to-backend',
          value: '(?<value>.*)',
        },
      ],
      destination: `${baseUrl}/:path*`,
    });
    
    return rewrites;
  },
};

module.exports = nextConfig; 