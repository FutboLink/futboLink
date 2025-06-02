"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ISuccessCase } from "@/Interfaces/ISuccessCase";
import { fetchAllSuccessCases } from "../Fetchs/SuccessCasesFetchs";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
        setSuccessCases(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    loadSuccessCases();
  }, []);

  // Función para navegar a la página de detalles
  const navigateToCase = (caseId: string | undefined) => {
    if (!caseId) return;
    router.push(`/success-case-viewer/${caseId}`);
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
                  className="object-contain rounded-xl w-full h-full"
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
                onClick={() => navigateToCase(successCase.id)}
                className="mt-4 px-4 py-2 bg-[#1d5126] text-white rounded-md hover:bg-[#3e7c27] transition-colors"
              >
                Leer más
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="swiper-pagination mt-8"></div>
      </div>
    </section>
  );
};

export default ClientsSwiper;
