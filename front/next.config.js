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
    console.log('Environment:', process.env.NODE_ENV);
    
    // Auth specific routes
    rewrites.push({
      source: '/api/login',
      destination: `${baseUrl}/login`,
      has: [
        {
          type: 'header',
          key: 'x-forward-to-backend',
        },
      ],
    });
    
    // More explicit login route
    rewrites.push({
      source: '/login',
      destination: `${baseUrl}/login`,
      has: [
        {
          type: 'header',
          key: 'x-forward-to-backend',
        },
      ],
    });
    
    // Redirección para API general
    rewrites.push({
      source: '/api/:path*',
      destination: `${baseUrl}/:path*`,
      has: [
        {
          type: 'header',
          key: 'x-forward-to-backend',
        },
      ],
    });
    
    // User related endpoints
    rewrites.push({
      source: '/user/:path*',
      destination: `${baseUrl}/user/:path*`,
      has: [
        {
          type: 'header',
          key: 'x-forward-to-backend',
        },
      ],
    });
    
    // Redirección específica para el endpoint de contacto
    rewrites.push({
      source: '/email/contact',
      destination: `${baseUrl}/email/contact`,
      has: [
        {
          type: 'header',
          key: 'x-forward-to-backend',
        },
      ],
    });
    
    // Redirección específica para las opciones CORS
    rewrites.push({
      source: '/email/:path*',
      destination: `${baseUrl}/email/:path*`,
      has: [
        {
          type: 'header',
          key: 'x-forward-to-backend',
        },
      ],
    });
    
    // Add rewrites for other specific endpoints that are failing
    rewrites.push({
      source: '/News',
      destination: `${baseUrl}/News`,
      has: [
        {
          type: 'header',
          key: 'x-forward-to-backend',
        },
      ],
    });
    
    rewrites.push({
      source: '/News/:path*',
      destination: `${baseUrl}/News/:path*`,
      has: [
        {
          type: 'header',
          key: 'x-forward-to-backend',
        },
      ],
    });
    
    // Success cases endpoints - enhanced with proper header handling
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
      has: [
        {
          type: 'header',
          key: 'x-forward-to-backend',
        },
      ],
    });
    
    // Jobs
    rewrites.push({
      source: '/jobs/:path*',
      destination: `${baseUrl}/jobs/:path*`,
      has: [
        {
          type: 'header',
          key: 'x-forward-to-backend',
        },
      ],
    });
    
    // Applications
    rewrites.push({
      source: '/applications/:path*',
      destination: `${baseUrl}/applications/:path*`,
      has: [
        {
          type: 'header',
          key: 'x-forward-to-backend',
        },
      ],
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