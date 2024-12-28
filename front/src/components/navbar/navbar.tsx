"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../../../public/logoP1.png";
import Head from "next/head";
import Link from "next/link";

function Navbar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navigateTo = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false); // Cierra el menú móvil después de la navegación
  };

  // Cerrar el dropdown si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
                height={75}
                width={75}
                alt="Futbol Career logo"
                className="rounded-2xl"
              />
            </Link>

            {/* Menú para escritorio */}
            <ul className="hidden sm:flex gap-6 text-lg text-white">
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
                onClick={() => navigateTo("/NoticesApp")}
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

          {/* Sección derecha con los botones de Iniciar sesión y Registrarse (solo en escritorio) */}
          <div id="sectionTwo" className="relative hidden sm:flex">
            <button
              onClick={toggleDropdown}
              className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen ? "true" : "false"}
            >
              Iniciar sesión
            </button>

            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-md"
              >
                <div
                  onClick={() => navigateTo("/Login")}
                  className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  aria-label="Iniciar sesión como Jugador"
                >
                  Jugador
                </div>
                <div
                  onClick={() => navigateTo("/Login")}
                  className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  aria-label="Iniciar sesión como Representante"
                >
                  Representante
                </div>
                <div
                  onClick={() => navigateTo("/Login")}
                  className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  aria-label="Iniciar sesión como Agencia"
                >
                  Agencia
                </div>
              </div>
            )}

            <button
              onClick={() => navigateTo("/OptionUsers")}
              className="bg-white text-green-600 px-4 py-2 rounded-md ml-4 hover:bg-gray-200"
              aria-label="Registrarse"
            >
              Registrarse
            </button>
          </div>

          {/* Menú Hamburguesa en pantallas pequeñas */}
          <button
            onClick={toggleMobileMenu}
            className="sm:hidden text-white focus:outline-none"
            aria-label="Abrir menú móvil"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </section>

        {/* Menú desplegable móvil */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-green-600 text-white text-lg p-4">
            <ul>
              <li
                onClick={() => navigateTo("/Offer")}
                className="px-4 py-2 hover:bg-green-200 hover:text-black rounded-md transition-all cursor-pointer"
              >
                Ofertas
              </li>
              <li
                onClick={() => navigateTo("/Formation")}
                className="px-4 py-2 hover:bg-green-200 hover:text-black rounded-md transition-all cursor-pointer"
              >
                Cursos y Formación
              </li>
              <li
                onClick={() => navigateTo("/NoticesApp")}
                className="px-4 py-2 hover:bg-green-200 hover:text-black rounded-md transition-all cursor-pointer"
              >
                Noticias
              </li>
              <li
                onClick={() => navigateTo("/Subs")}
                className="px-4 py-2 hover:bg-green-200 hover:text-black rounded-md transition-all cursor-pointer"
              >
                Suscripciones
              </li>
              <li
                onClick={() => navigateTo("/Contact")}
                className="px-4 py-2 hover:bg-green-200 hover:text-black rounded-md transition-all cursor-pointer"
              >
                Contacto
              </li>
              <li
                onClick={() => navigateTo("/Help")}
                className="px-4 py-2 hover:bg-green-200 hover:text-black rounded-md transition-all cursor-pointer"
              >
                ¿Cómo uso FC?
              </li>
            </ul>

            <div className="mt-4">
              <Link href={"/Login"}>
                <button
                  onClick={toggleDropdown}
                  className="w-full bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600"
                >
                  Iniciar sesión
                </button>
              </Link>
              <button
                onClick={() => navigateTo("/OptionUsers")}
                className="w-full bg-white text-green-600 px-4 py-2 rounded-md mt-2 hover:bg-gray-200"
              >
                Registrarse
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;
