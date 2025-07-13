"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function AboutFutbolink() {
  useEffect(() => {
    // Add any client-side effects here if needed
  }, []);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <Head>
        <title>Sobre Futbolink | La plataforma líder de oportunidades en fútbol</title>
        <meta
          name="description"
          content="Conoce más sobre Futbolink, la plataforma profesional que conecta talento y oportunidades en el mundo del fútbol. Futbolink crea puentes para tu futuro deportivo."
        />
        <meta name="keywords" content="futbolink, sobre futbolink, plataforma de fútbol, oportunidades en fútbol, futbolink plataforma" />
      </Head>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-green-700 mb-4">
            Sobre Futbolink
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            La plataforma profesional que conecta talento y oportunidades en el mundo del fútbol
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-16">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <Image
              src="/logoD.png"
              alt="Logo de Futbolink"
              width={400}
              height={400}
              className="rounded-lg shadow-lg mx-auto"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-semibold text-green-600 mb-4">
              ¿Qué es Futbolink?
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              <strong>Futbolink</strong> es la plataforma líder que conecta a jugadores de fútbol con oportunidades profesionales en todo el mundo. Nacida con la misión de democratizar el acceso a oportunidades en el fútbol, <strong>Futbolink</strong> sirve como puente entre el talento y los clubes, representantes y academias que buscan ese talento.
            </p>
            <p className="text-lg text-gray-700">
              En <strong>Futbolink</strong> creemos que el talento debe tener la oportunidad de brillar, independientemente de dónde provenga. Nuestra plataforma facilita conexiones que de otro modo serían imposibles, abriendo puertas a carreras profesionales en el deporte más popular del mundo.
            </p>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-semibold text-green-600 mb-6 text-center">
            Nuestra Misión en Futbolink
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-700 mb-3">Conectar</h3>
              <p className="text-gray-700">
                <strong>Futbolink</strong> conecta jugadores con clubes, representantes y academias, creando una red global de oportunidades en el fútbol profesional.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-700 mb-3">Potenciar</h3>
              <p className="text-gray-700">
                Potenciamos carreras deportivas proporcionando herramientas, recursos y visibilidad para que los talentos de <strong>Futbolink</strong> alcancen su máximo potencial.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-700 mb-3">Transformar</h3>
              <p className="text-gray-700">
                Transformamos el proceso de reclutamiento en el fútbol, haciéndolo más transparente, accesible y eficiente a través de la plataforma <strong>Futbolink</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-green-600 mb-8 text-center">
            ¿Por qué elegir Futbolink?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Alcance Global</h3>
                <p className="text-gray-700">
                  <strong>Futbolink</strong> conecta talento con oportunidades en todo el mundo, eliminando barreras geográficas.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Visibilidad Profesional</h3>
                <p className="text-gray-700">
                  Crea un perfil profesional en <strong>Futbolink</strong> que destaque tus habilidades y logros ante reclutadores de todo el mundo.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Oportunidades Verificadas</h3>
                <p className="text-gray-700">
                  Todas las ofertas en <strong>Futbolink</strong> son verificadas para garantizar su legitimidad y proteger a nuestros usuarios.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Recursos Educativos</h3>
                <p className="text-gray-700">
                  <strong>Futbolink</strong> ofrece cursos y recursos para el desarrollo profesional de jugadores, entrenadores y representantes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-semibold text-green-600 mb-6">
            Únete a la Comunidad Futbolink
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
            Ya sea que busques impulsar tu carrera como jugador o encontrar el próximo talento para tu equipo, <strong>Futbolink</strong> es tu plataforma. Únete hoy y forma parte de la revolución en el mundo del fútbol.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/OptionUsers" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300">
              Registrarse en Futbolink
            </Link>
            <Link href="/contact" className="bg-white border-2 border-green-600 hover:bg-green-50 text-green-600 font-bold py-3 px-8 rounded-lg transition duration-300">
              Contactar con Futbolink
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 