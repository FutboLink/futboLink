import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["example.com", "u-storage.com.mx", "img.freepik.com"], // Permite cargar imágenes de Freepik
  },
};

export default nextConfig;
