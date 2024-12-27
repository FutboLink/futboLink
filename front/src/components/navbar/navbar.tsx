"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../../../public/logoP1.png";
import Head from "next/head";
import Link from "next/link";

function Navbar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

 
  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <Head>
        <title>Futbol Career - Ofertas, Cursos, Noticias y Más</title>
        <meta
          name="description"
          content="Encuentra ofertas de futbol, cursos de formación, noticias y más con Futbol Career. Regístrate o inicia sesión para empezar."
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <nav className="fixed top-0 left-0 w-full z-50 bg-green-600">
        <section className="flex items-center justify-between p-4">
          {/* Sección izquierda con logo y links */}
          <div id="sectionOne" className="flex items-center gap-6">
            <Link href={"/"}>
              <Image
                src={logo}
                height={200}
                width={200}
                alt="Futbol Career logo"
                className="bg-white rounded-2xl"
              />
            </Link>
            <ul className="flex gap-6 text-lg text-white">
              <li
                onClick={() => navigateTo("/Offer")}
                className="px-4 hover:bg-green-200 hover:text-black hover:rounded-md transition-all cursor-pointer"
                aria-label="Ofertas de empleo"
              >
                Ofertas
              </li>
              <li
                onClick={() => navigateTo("/Formation")}
                className="px-4 hover:bg-green-200 hover:text-black hover:rounded-md transition-all cursor-pointer"
                aria-label="Cursos y formación en futbol"
              >
                Cursos y Formación
              </li>
              <li
                onClick={() => navigateTo("/Notices")}
                className="px-4 hover:bg-green-200 hover:text-black hover:rounded-md transition-all cursor-pointer"
                aria-label="Noticias relacionadas con futbol"
              >
                Noticias
              </li>
              <li
                onClick={() => navigateTo("/Subs")}
                className="px-4 hover:bg-green-200 hover:text-black hover:rounded-md transition-all cursor-pointer"
                aria-label="Suscripciones a servicios de fútbol"
              >
                Suscripciones
              </li>
              <li
                onClick={() => navigateTo("/Contact")}
                className="px-4 hover:bg-green-200 hover:text-black hover:rounded-md transition-all cursor-pointer"
                aria-label="Contacto"
              >
                Contacto
              </li>
              <li
                onClick={() => navigateTo("/Help")}
                className="px-4 hover:bg-green-200 hover:text-black hover:rounded-md transition-all cursor-pointer"
                aria-label="Cómo usar Futbol Career"
              >
                ¿Cómo uso FC?
              </li>
            </ul>
          </div>

          {/* Sección derecha con el botón de Iniciar sesión */}
          <div id="sectionTwo" className="relative">
            <button
              onClick={toggleDropdown}
              className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen ? "true" : "false"}
            >
              Iniciar sesión
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-md">
                <div
                  onClick={() => navigateTo("/login/jugador")}
                  className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  aria-label="Iniciar sesión como Jugador"
                >
                  Jugador
                </div>
                <div
                  onClick={() => navigateTo("/login/representante")}
                  className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  aria-label="Iniciar sesión como Representante"
                >
                  Representante
                </div>
                <div
                  onClick={() => navigateTo("/login/agencia")}
                  className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  aria-label="Iniciar sesión como Agencia"
                >
                  Agencia
                </div>
              </div>
            )}

            <button
              onClick={() => navigateTo("/register")}
              className="bg-white text-green-600 px-4 py-2 rounded-md ml-4 hover:bg-gray-200"
              aria-label="Registrarse en Futbol Career"
            >
              Registrarse
            </button>
          </div>
        </section>
      </nav>
    </>
  );
}

export default Navbar;
