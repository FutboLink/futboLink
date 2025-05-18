"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ISuccessCase } from "@/Interfaces/ISuccessCase";
import { fetchAllSuccessCases } from "../Fetchs/SuccessCasesFetchs";
import Link from "next/link";

// Datos de ejemplo por si falla la API
const fallbackData = [
  {
    id: "1",
    name: "Pablo Toani",
    role: "Jugador de Fútbol",
    testimonial:
      "Gracias a FutboLink encontré mi lugar en Italia. Hoy juego en el Mesoraca y estoy viviendo una experiencia increíble.",
    imgUrl: "/fotoPablo.jpg",
    longDescription: "",
    isPublished: true
  },
  {
    id: "2",
    name: "Facundo Espindola",
    role: "24 años — Argentino",
    testimonial:
      "FutboLink me ayudó a mostrarme y gracias a eso llegué a 9 de Julio. Estoy feliz de poder seguir creciendo en el Federal A.",
    imgUrl: "/1.jpg",
    longDescription: "",
    isPublished: true
  },
  {
    id: "3",
    name: "Raimundo Pedro Martins Da Silva",
    role: "29 años — Brasiliano 🇧🇷",
    testimonial:
      "Con FutboLink pude dar el salto y venir a Italia. Ahora juego en el Mesoraca, cumpliendo un sueño que siempre tuve.",
    imgUrl: "/2.jpg",
    longDescription: "",
    isPublished: true
  },
  {
    id: "4",
    name: "Julian Picart",
    role: "19 años — Argentino",
    testimonial:
      "A través de FutboLink, conecté con clubes de España y terminé firmando en UE Alcudia. Muy contento con todo el proceso.",
    imgUrl: "/3.jpg",
    longDescription: "",
    isPublished: true
  },
];

const ClientsSwiper: React.FC = () => {
  const [successCases, setSuccessCases] = useState<ISuccessCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<ISuccessCase | null>(null);

  useEffect(() => {
    const loadSuccessCases = async () => {
      try {
        const data = await fetchAllSuccessCases();
        // Filtrar solo los casos publicados
        const publishedCases = Array.isArray(data) 
          ? data.filter(c => c.isPublished !== false)
          : [];
        
        setSuccessCases(publishedCases.length > 0 ? publishedCases : fallbackData);
      } catch (err) {
        console.error("Error al cargar casos de éxito:", err);
        setError("No se pudieron cargar los casos de éxito");
        setSuccessCases(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    loadSuccessCases();
  }, []);

  // Función para abrir el modal de detalles
  const openCaseDetails = (successCase: ISuccessCase) => {
    setSelectedCase(successCase);
    
    // Desplazar al usuario a la parte superior de la pantalla
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Evitar scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setSelectedCase(null);
    document.body.style.overflow = 'auto';
  };

  if (loading) {
    return (
      <section id="casos-de-exito" className="bg-[#f5f5f5] py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold text-[#1d5126] mb-8">
            Casos de Éxito
          </h2>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d5126]"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="casos-de-exito" className="bg-[#f5f5f5] py-12">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-semibold text-[#1d5126] mb-8">
          Casos de Éxito
        </h2>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <Swiper
          spaceBetween={50}
          slidesPerView={1}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{
            el: ".swiper-pagination",
            clickable: true,
            dynamicBullets: true,
          }}
          modules={[Autoplay, Pagination]}
          className="max-w-6xl mx-auto px-4"
        >
          {successCases.map((successCase) => (
            <SwiperSlide
              key={successCase.id}
              className="flex flex-col justify-start items-center bg-white p-4 rounded-2xl shadow-lg h-[500px] w-full"
            >
              <div className="flex justify-center items-center h-[250px] w-full mb-4 overflow-hidden rounded-xl">
                <img
                  src={successCase.imgUrl}
                  alt={successCase.name}
                  className="object-cover rounded-xl w-full h-full"
                />
              </div>
              <h3 className="text-lg font-semibold text-[#1d5126] mt-2">
                {successCase.name}
              </h3>
              <p className="text-sm text-gray-600">{successCase.role}</p>
              <p className="text-gray-700 italic text-sm mt-2 px-2 flex-grow overflow-hidden line-clamp-3">
                {successCase.testimonial}
              </p>
              <button
                onClick={() => openCaseDetails(successCase)}
                className="mt-4 px-4 py-2 bg-[#1d5126] text-white rounded-md hover:bg-[#3e7c27] transition-colors"
              >
                Leer más
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="swiper-pagination mt-8"></div>
      </div>

      {/* Modal de detalles */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#1d5126] text-white hover:bg-[#3e7c27] transition-colors"
              >
                &times;
              </button>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="w-full h-64 overflow-hidden rounded-lg">
                      <img
                        src={selectedCase.imgUrl}
                        alt={selectedCase.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="md:w-2/3">
                    <h2 className="text-2xl font-bold text-[#1d5126] mb-2">{selectedCase.name}</h2>
                    <p className="text-gray-600 mb-4">{selectedCase.role}</p>
                    
                    <div className="prose max-w-none">
                      <p className="text-gray-800 italic mb-6">
                        "{selectedCase.testimonial}"
                      </p>
                      
                      {selectedCase.longDescription ? (
                        <div className="mt-4 text-gray-700">
                          {selectedCase.longDescription.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4">{paragraph}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700">
                          Esta historia de éxito muestra cómo FutboLink puede ayudar a los jugadores a alcanzar sus metas y conectar con oportunidades en todo el mundo.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClientsSwiper;
