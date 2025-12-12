/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimizaciones para reducir uso de memoria
  swcMinify: true, // Usar SWC para minificación (más eficiente que Terser)
  compress: true, // Habilitar compresión gzip
  poweredByHeader: false, // Remover header X-Powered-By para seguridad
  
  // Configuración de compilación para reducir memoria
  experimental: {
    // Optimizar el uso de memoria durante el build
    optimizeCss: true,
  },
  
  // Configuración de imágenes
  images: {
    domains: [
      'res.cloudinary.com',  // Dominio principal de Cloudinary
      'cloudinary.com',      // Dominio alternativo
      'api.cloudinary.com',  // API de Cloudinary
      'img.freepik.com',     // Freepik para imágenes
      'dummyimage.com',      // Servicio de imágenes de marcador de posición
      'u-storage.com.mx',    // Almacenamiento de imágenes
    ],
    // HABILITAR optimización de imágenes para reducir uso de memoria
    unoptimized: false,
    // Configuración de tamaños de imagen para optimizar memoria
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
  
  // DISABLED ALL REDIRECTS to fix the redirect loop
  async redirects() {
    console.log('ALL REDIRECTS DISABLED to fix redirect loop');
    return [];
  },
  
  // Configuración de reescritura de rutas
  async rewrites() {
    // Usar siempre la URL de producción para las API
    const baseUrl = 'https://futbolink.onrender.com';
    
    console.log(`Next.js rewrite configuration using baseUrl: ${baseUrl}`);
    console.log('Contact path is NOT being rewritten - it should be served from local Pages Router');
    
    // Define all rewrites
    return [
      // API endpoints
      {
        source: '/api/:path*',
        destination: `${baseUrl}/api/:path*`,
      },
      
      // News endpoints
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
      // Contact API endpoint - direct path as used in the form
      {
        source: '/contact',
        destination: `${baseUrl}/contact`,
      },
      // For jobs API endpoints, let's just use the API directly
      {
        source: '/api/jobs/:id',
        destination: `${baseUrl}/jobs/:id`,
      },
      {
        source: '/api/jobs',
        destination: `${baseUrl}/jobs`,
      },
      {
        source: '/jobs',
        destination: `${baseUrl}/jobs`,
      },
      {
        source: '/email/:path*',
        destination: `${baseUrl}/email/:path*`,
      },
    ];
  },
};

module.exports = nextConfig; 