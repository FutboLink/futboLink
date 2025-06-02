/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Habilitar explícitamente el uso del sistema de páginas antiguo
  // junto con el nuevo App Router
  experimental: {
    appDir: true, // Mantener el App Router
  },
  
  // Configuración de imágenes
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
  
  // Configuración de reescritura de rutas
  async rewrites() {
    // Usar siempre la URL de producción para las API
    const baseUrl = 'https://futbolink.onrender.com';
    
    console.log(`Next.js rewrite configuration using baseUrl: ${baseUrl}`);
    
    // Define all rewrites
    return [
      // API endpoints
      {
        source: '/api/:path*',
        destination: `${baseUrl}/api/:path*`,
      },
      
      // News endpoints - IMPORTANT: More specific routes first
      {
        source: '/News/api/:path*',
        destination: `${baseUrl}/News/:path*`,
      },
      {
        source: '/News/:id*',
        destination: `${baseUrl}/News/:id*`,
      },
      {
        source: '/News',
        destination: `${baseUrl}/News`,
      },
      
      // Other specific routes
      {
        source: '/success-cases/:path*',
        destination: `${baseUrl}/success-cases/:path*`,
      },
      {
        source: '/success-cases',
        destination: `${baseUrl}/success-cases`,
      },
      {
        source: '/videos/:path*',
        destination: `${baseUrl}/videos/:path*`,
      },
      {
        source: '/videos',
        destination: `${baseUrl}/videos`,
      },
      {
        source: '/user/:path*',
        destination: `${baseUrl}/user/:path*`,
      },
      {
        source: '/login/:path*',
        destination: `${baseUrl}/login/:path*`,
      },
      {
        source: '/login',
        destination: `${baseUrl}/login`,
      },
      {
        source: '/contact',
        destination: `${baseUrl}/contact`,
      },
      {
        source: '/jobs/:path*',
        destination: `${baseUrl}/jobs/:path*`,
      },
      {
        source: '/jobs',
        destination: `${baseUrl}/jobs`,
      },
      {
        source: '/email/contact',
        destination: `${baseUrl}/email/contact`,
      },
      {
        source: '/email/:path*',
        destination: `${baseUrl}/email/:path*`,
      },
    ];
  },
};

module.exports = nextConfig; 