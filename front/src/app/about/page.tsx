"use client";

import React from "react";
import Image from "next/image";
import logo from "../../../public/logoD.png";

export default function AboutFutbolink() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-verde-oscuro">
          Sobre Futbolink
        </h1>

        <div className="flex flex-col items-center mb-16">
          <Image
            src={logo}
            alt="Logo de Futbolink"
            width={300}
            height={300}
            className="mb-8"
          />
          <p className="text-xl text-black text-center max-w-3xl">
            Futbolink es la plataforma líder que conecta talento y oportunidades en el mundo del fútbol profesional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-verde-oscuro">La Misión de Futbolink</h2>
            <p className="text-lg text-black">
              En Futbolink, nuestra misión es democratizar el acceso a oportunidades en el mundo del fútbol. 
              Creemos que el talento está en todas partes, pero las oportunidades no siempre son accesibles para todos. 
              Futbolink existe para cambiar esta realidad, conectando jugadores, entrenadores, agentes y clubes 
              en una plataforma única diseñada específicamente para el ecosistema del fútbol.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-verde-oscuro">La Visión de Futbolink</h2>
            <p className="text-lg text-black">
              Futbolink aspira a ser el punto de encuentro definitivo para todos los profesionales del fútbol. 
              Nuestra visión es crear un ecosistema donde el talento pueda ser descubierto, donde las 
              oportunidades sean transparentes, y donde cada persona involucrada en el mundo del fútbol 
              pueda encontrar su camino hacia el éxito profesional.
            </p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-verde-oscuro text-center">
            ¿Por qué elegir Futbolink?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Conexiones de Calidad</h3>
              <p className="text-black">
                Futbolink conecta a profesionales del fútbol con oportunidades verificadas y de calidad, 
                eliminando intermediarios innecesarios.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Plataforma Especializada</h3>
              <p className="text-black">
                A diferencia de otras plataformas generales de empleo, Futbolink está diseñada específicamente 
                para el mundo del fútbol, entendiendo sus particularidades.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Desarrollo Profesional</h3>
              <p className="text-black">
                Futbolink no solo ofrece oportunidades laborales, sino también formación y recursos para 
                el desarrollo profesional continuo.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-6 text-verde-oscuro">El Equipo Futbolink</h2>
          <p className="text-lg text-black  max-w-3xl mx-auto mb-8">
            Detrás de Futbolink hay un equipo de profesionales apasionados por el fútbol y la tecnología, 
            comprometidos con crear la mejor plataforma para conectar talento y oportunidades en el mundo del fútbol.
          </p>
          <p className="text-lg font-semibold text-black">
            ¡Únete a la comunidad Futbolink y lleva tu carrera en el fútbol al siguiente nivel!
          </p>
        </div>
      </div>
    </div>
  );
} 