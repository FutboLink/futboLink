'use client';

import { useEffect, useState } from 'react';

interface CloudinaryWidgetProps {
  onUploadSuccess: (url: string) => void;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  folder?: string;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

const CloudinaryWidget: React.FC<CloudinaryWidgetProps> = ({
  onUploadSuccess,
  resourceType = 'image',
  folder = 'testimonials'
}) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load Cloudinary script
  useEffect(() => {
    if (!document.getElementById('cloudinary-widget-script')) {
      const script = document.createElement('script');
      script.id = 'cloudinary-widget-script';
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      script.onerror = () => setError('Error al cargar el widget de Cloudinary');
      document.body.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  const openWidget = () => {
    if (!isScriptLoaded) {
      setError('Esperando a que cargue el widget...');
      return;
    }

    setLoading(true);
    setError(null);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError('Configuración de Cloudinary no disponible');
      setLoading(false);
      return;
    }

    const options = {
      cloudName,
      uploadPreset,
      folder,
      resourceType,
      sources: ['local', 'url'],
      multiple: false,
      clientAllowedFormats: resourceType === 'image' ? ['jpg', 'jpeg', 'png', 'gif', 'webp'] : undefined,
      maxImageFileSize: 5000000, // 5MB
      maxVideoFileSize: 20000000, // 20MB if video
      styles: {
        palette: {
          window: '#FFFFFF',
          windowBorder: '#90A0B3',
          tabIcon: '#0078FF',
          menuIcons: '#5A616A',
          textDark: '#000000',
          textLight: '#FFFFFF',
          link: '#0078FF',
          action: '#1d5126',
          inactiveTabIcon: '#0E2F5A',
          error: '#F44235',
          inProgress: '#0078FF',
          complete: '#20B832',
          sourceBg: '#F4F4F5'
        },
        fonts: {
          default: null,
          "'Poppins', sans-serif": {
            url: 'https://fonts.googleapis.com/css?family=Poppins',
            active: true
          }
        }
      }
    };

    const widget = window.cloudinary.createUploadWidget(
      options,
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          const { secure_url } = result.info;
          onUploadSuccess(secure_url);
          widget.close();
        }

        if (error) {
          console.error('Cloudinary widget error:', error);
          setError('Error al subir el archivo');
        }

        if (result.event === 'close') {
          setLoading(false);
        }
      }
    );

    widget.open();
  };

  return (
    <div className="cloudinary-widget">
      <button
        type="button"
        onClick={openWidget}
        disabled={loading || !isScriptLoaded}
        className={`w-full px-4 py-2 bg-[#1d5126] hover:bg-[#3e7c27] text-white font-medium rounded-md flex items-center justify-center transition-colors duration-300 ${
          loading || !isScriptLoaded ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Subiendo...' : 'Subir imagen a Cloudinary'}
      </button>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default CloudinaryWidget; 