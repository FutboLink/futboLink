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
    
    return rewrites;
  },
};

module.exports = nextConfig; 