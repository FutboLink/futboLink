"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/effect-cards";

const clients = [
  {
    name: "Pablo Toani",
    age: "Jugador de Fútbol",
    testimonial:
      "Gracias a FutboLink encontré mi lugar en Italia. Hoy juego en el Mesoraca y estoy viviendo una experiencia increíble.",
    imgUrl: "/fotoPablo.jpg",
  },
  {
    name: "Facundo Espindola",
    age: "24 años — Argentino",
    testimonial:
      "FutboLink me ayudó a mostrarme y gracias a eso llegué a 9 de Julio. Estoy feliz de poder seguir creciendo en el Federal A.",
    imgUrl: "/1.jpg",
  },
  {
    name: "Raimundo Pedro Martins Da Silva",
    age: "29 años — Brasiliano 🇧🇷",
    testimonial:
      "Con FutboLink pude dar el salto y venir a Italia. Ahora juego en el Mesoraca, cumpliendo un sueño que siempre tuve.",
    imgUrl: "/2.jpg",
  },
  {
    name: "Julian Picart",
    age: "19 años — Argentino",
    testimonial:
      "A través de FutboLink conecté con clubes de España y terminé firmando en UE Alcudia. Muy contento con todo el proceso.",
    imgUrl: "/3.jpg",
  },
];

const ClientsSwiper: React.FC = () => {
  return (
    <section className="bg-[#f5f5f5] py-12">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-semibold text-[#1d5126] mb-8">
          Casos de Éxito
        </h2>
        <Swiper
          effect={"cards"}
          grabCursor={true}
          modules={[EffectCards]}
          className="mySwiper max-w-[320px] md:max-w-[380px] mx-auto"
        >
          {clients.map((client, index) => (
            <SwiperSlide
              key={index}
              className="flex flex-col justify-start items-center bg-white p-4 rounded-2xl shadow-lg h-[500px] w-[300px]"
            >
              <div className="flex justify-center items-center h-[300px] w-full mb-4 overflow-hidden rounded-xl">
                <Image
                  src={client.imgUrl}
                  alt={client.name}
                  width={280}
                  height={280}
                  className="object-cover rounded-xl"
                />
              </div>
              <h3 className="text-lg font-semibold text-[#1d5126] mt-2">
                {client.name}
              </h3>
              <p className="text-sm text-gray-600">{client.age}</p>
              <p className="text-gray-700 italic text-sm mt-2 px-2">
                {client.testimonial}
              </p>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ClientsSwiper;
