'use client';

import React, { useEffect, useState } from 'react';
import { ISuccessCase } from '@/Interfaces/ISuccessCase';
import { fetchSuccessCaseById } from '@/components/Fetchs/SuccessCasesFetchs';
import Link from 'next/link';
import Navbar from "@/components/navbar/navbar";
import Footer from '@/components/Footer/footer';

interface SuccessCaseDetailProps {
  id: string;
}

export default function SuccessCaseDetail({ id }: SuccessCaseDetailProps) {
  const [successCase, setSuccessCase] = useState<ISuccessCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const loadSuccessCase = async () => {
      try {
        setLoading(true);
        const data = await fetchSuccessCaseById(id);
        setSuccessCase(data);
        
        // Set document title when data is loaded (client-side only)
        if (data && typeof window !== 'undefined') {
          document.title = `${data.name} - Casos de Éxito | FutboLink`;
        }
      } catch (err) {
        console.error("Error al cargar el caso de éxito:", err);
        setError("No se pudo cargar el caso de éxito");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadSuccessCase();
    }
  }, [id]);

  if (loading && !isClient) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-12 min-h-screen">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d5126]"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !successCase) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-12 min-h-screen">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-700 mb-6">{error || "No se encontró el caso de éxito solicitado"}</p>
            <Link 
              href="/#casos-de-exito" 
              className="px-4 py-2 bg-[#1d5126] text-white rounded-md hover:bg-[#3e7c27] transition-colors"
            >
              Volver a casos de éxito
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-50">
        {/* Cabecera con imagen de fondo */}
        <div className="relative h-[300px] md:h-[400px] bg-gray-800">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ 
              backgroundImage: `url(${successCase.imgUrl})`,
              backgroundPosition: 'center 25%',
              backgroundSize: 'cover',
              filter: 'blur(2px)',
              opacity: 0.8
            }}
          ></div>
          <div className="container relative mx-auto px-4 h-full flex flex-col justify-end pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {successCase.name}
            </h1>
            <p className="text-xl text-white mb-4 drop-shadow-md">
              {successCase.role}
            </p>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
            {/* Imagen perfil */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="md:w-1/3">
                <div className="overflow-hidden rounded-lg shadow-md">
                  <img 
                    src={successCase.imgUrl} 
                    alt={successCase.name} 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
              
              <div className="md:w-2/3">
                <blockquote className="text-xl italic text-gray-700 border-l-4 border-[#1d5126] pl-4 py-2 mb-6">
                  "{successCase.testimonial}"
                </blockquote>
                
                <div className="flex items-center mt-4">
                  <div className="h-1 w-16 bg-[#1d5126] mr-3"></div>
                  <span className="text-sm text-gray-600 uppercase">Historia de éxito</span>
                </div>
              </div>
            </div>
            
            {/* Contenido detallado */}
            <div className="prose prose-lg max-w-none">
              {successCase.longDescription ? (
                <div className="mt-6">
                  {successCase.longDescription.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <h2 className="text-2xl font-semibold text-[#1d5126] mb-4">
                    De nuestros testimonios a tu historia
                  </h2>
                  <p className="mb-4 text-gray-700 leading-relaxed">
                    {successCase.name} es uno de los muchos talentos que han encontrado su camino 
                    gracias a FutboLink, la plataforma que conecta profesionales del fútbol con 
                    oportunidades reales en todo el mundo.
                  </p>
                  <p className="mb-4 text-gray-700 leading-relaxed">
                    Su experiencia muestra cómo FutboLink puede ser el puente entre tus sueños y 
                    una carrera exitosa en el ámbito futbolístico, ya sea como jugador, entrenador 
                    o cualquier rol relacionado con este deporte.
                  </p>
                  <p className="mb-4 text-gray-700 leading-relaxed">
                    Únete a nuestra comunidad y forma parte de las próximas historias de éxito.
                  </p>
                </div>
              )}
            </div>
            
            {/* Enlace para volver */}
            <div className="mt-12 flex justify-between items-center">
              <Link 
                href="/#casos-de-exito" 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a casos de éxito
              </Link>
              <Link 
                href="/Subs" 
                className="px-4 py-2 bg-[#1d5126] text-white rounded-md hover:bg-[#3e7c27] transition-colors"
              >
                ¿Quieres ser el próximo?
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 