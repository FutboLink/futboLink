/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimizaciones para reducir uso de memoria
  // swcMinify ya no es necesario en Next.js 15 (SWC es el default)
  compress: true, // Habilitar compresión gzip
  poweredByHeader: false, // Remover header X-Powered-By para seguridad
  
  // Configuración de compilación para reducir memoria
  experimental: {
    // Optimizar el uso de memoria durante el build
    optimizeCss: false, // Deshabilitar durante build para reducir memoria
    // Reducir el uso de memoria en runtime
    optimizePackageImports: ['react-icons', 'framer-motion'],
  },
  
  // Deshabilitar source maps en producción para reducir memoria durante build
  productionBrowserSourceMaps: false,
  
  // Reducir el tamaño del bundle (simplificado para reducir memoria durante build)
  webpack: (config, { isServer, dev }) => {
    // Solo optimizar en producción y para cliente
    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Agrupar vendor chunks para mejor caching
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Separar react y react-dom
            react: {
              name: 'react',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 30,
            },
          },
        },
      };
    }
    return config;
  },
  
  // Configuración de imágenes
  images: {
    domains: [
      'res.cloudinary.com',  // Dominio principal de Cloudinary (mantener para compatibilidad)
      'cloudinary.com',      // Dominio alternativo
      'api.cloudinary.com',  // API de Cloudinary
      'pub-a77ca935b7d648d68ee649162076971b.r2.dev',  // Cloudflare R2 - nuevo almacenamiento
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
        hostname: 'pub-a77ca935b7d648d68ee649162076971b.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
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