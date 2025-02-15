import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['example.com', "img.freepik.com", 'res.cloudinary.com'], // Permite cargar imágenes de Freepik
  },
};

export default nextConfig;
