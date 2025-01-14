"use client";

import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../../../public/logoP1.png";
import Head from "next/head";
import Link from "next/link";
import { UserContext } from "../Context/UserContext";

function NavbarHome() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { isLogged } = useContext(UserContext); 

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
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

      {/* Navbar Desktop */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
          isScrolled ? "bg-green-600" : "bg-transparent"
        }`}
      >
        <section className="flex items-center justify-between sm:flex-row w-full p-4">
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
          <div id="sectionTwo" className="relative flex sm:ml-auto">
          {isLogged ? (
            // Si está logueado, mostrar el enlace al perfil
            <button
              onClick={() => navigateTo("/profile")}
              className="bg-yellow-500 text-black px-8 py-2 rounded-md hover:bg-yellow-600"
            >
              Perfil
            </button>
          ) : (
            <>
            <button
             onClick={() => navigateTo("/Login")}
              className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600"
              aria-label="Iniciar sesión"
            >
              Iniciar sesión
            </button>

            <button
              onClick={() => navigateTo("/OptionUsers")}
              className="bg-white text-green-600 px-4 py-2 rounded-md ml-4 hover:bg-gray-200"
              aria-label="Registrarse"
            >
              Registrarse
            </button>
            </>
          )}
        </div>
        </section>
      </nav>

      {/* Navbar Mobile */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-green-600 sm:hidden">
        <section className="flex justify-between p-4">
          {/* Logo */}
          <Link href={"/"}>
            <Image
              src={logo}
              height={60}
              width={60}
              alt="Futbol Career logo"
              className="rounded-2xl"
            />
          </Link>

          {/* Menú Hamburguesa */}
          <button
            onClick={toggleMobileMenu}
            className="text-white focus:outline-none"
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
          <div className="bg-green-600 text-white text-lg p-4">
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
            {isLogged ? (
            // Si está logueado, mostrar el enlace al perfil
            <button
              onClick={() => navigateTo("/profile")}
              className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600"
            >
              Perfil
            </button>
          ) : (
            <>
              <button
                onClick={toggleDropdown}
                className="w-full bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600"
              >
                Iniciar sesión
              </button>

              <button
                onClick={() => navigateTo("/OptionUsers")}
                className="w-full mt-4 bg-white text-green-600 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Registrarse
              </button>
              </>
          )}
      
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default NavbarHome;
