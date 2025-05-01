"use client";

import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import { UserContext } from "../Context/UserContext";
import { FaUser } from "react-icons/fa";

function NavbarHome() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { isLogged, role } = useContext(UserContext); 


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
        <title>FutboLink - Ofertas, Cursos, Noticias y Más</title>
        <meta
          name="description"
          content="Encuentra ofertas de futbol, cursos de formación, noticias y más con FutboLink. Regístrate o inicia sesión para empezar."
        />
        <meta name="robots" content="index, follow" />
      </Head>

      {/* Navbar Desktop */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
          isScrolled ? "bg-verde-oscuro" : "bg-transparent"
        }`}
      >
        <section className="flex items-center justify-between sm:flex-row w-full p-4">
          {/* Sección izquierda con logo y links */}
          <div id="sectionOne" className="flex items-center gap-6">
            <Link href={"/"}>
              <Image
                src="/logoD.png"
                height={75}
                width={75}
                alt="FutboLink logo"
                className="rounded-2xl"
              />
            </Link>
            <ul className="flex gap-6 text-lg text-white">
              <li
                onClick={() => navigateTo("/jobs")}
                className="px-4 hover:bg-green-200 hover:text-black hover:rounded-md transition-all cursor-pointer"
                aria-label="Ofertas de empleo"
              >
                Ofertas
              </li>
              <li
                onClick={() => navigateTo("/News")}
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
                onClick={() => navigateTo("/Help")}
                className="px-4 hover:bg-green-200 hover:text-black hover:rounded-md transition-all cursor-pointer"
                aria-label="Cómo usar FutboLink"
              >
                ¿Cómo uso FC?
              </li>
              <li
                onClick={() => navigateTo("/cursos")}
                className="px-4 hover:bg-green-200 hover:text-black hover:rounded-md transition-all cursor-pointer"
                aria-label="Cómo usar FutboLink"
              >
               Entrenamiento
              </li>
              <li
                onClick={() => navigateTo("/Contact")}
                className="px-4 hover:bg-green-200 hover:text-black hover:rounded-md transition-all cursor-pointer"
                aria-label="Contacto"
              >
                Contacto
              </li>
            </ul>
          </div>

          {/* Sección derecha con los botones de Iniciar sesión y Registrarse (solo en escritorio) */}
          <div id="sectionTwo" className="relative flex sm:ml-auto">
          {isLogged ? (
    role ? ( // Verifica si `role` tiene un valor antes de renderizar
      role === "PLAYER" ? (
        <button onClick={() => navigateTo("/PanelUsers/Player")}>
          <FaUser className="text-verde-oscuro hover:text-verde-claro hover:transition-all hover:scale-125" />
        </button>
      ) : role === "RECRUITER" ? (
        <button onClick={() => navigateTo("/PanelUsers/Manager")}>
          <FaUser className="text-verde-claro" />
        </button>
      ) : role === "ADMIN" ? (
        <button onClick={() => navigateTo("/PanelAdmin")}>
          <FaUser className="text-verde-claro" />
        </button>
      ) : null
    ) : (
      <div>Loading...</div> // O algún otro mensaje o indicador de carga
    )
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
              className="bg-white text-verde-oscuro px-4 py-2 rounded-md ml-4 hover:bg-gray-200"
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
      <nav className="fixed top-0 left-0 w-full z-50 bg-verde-oscuro sm:hidden">
        <section className="flex justify-between p-4">
          {/* Logo */}
          <Link href={"/"}>
            <Image
              src="/logoD.png"
              height={60}
              width={60}
              alt="FutboLink logo"
              className="rounded-2xl"
            />
          </Link>
          <div className="mt-4">
            {isLogged ? (
    role ? ( // Verifica si `role` tiene un valor antes de renderizar
      role === "PLAYER" ? (
        <button onClick={() => navigateTo("/PanelUsers/Player")}>
          <FaUser className="text-green-700" />
        </button>
      ) : role === "RECRUITER" ? (
        <button onClick={() => navigateTo("/PanelUsers/Manager")}>
          <FaUser className="text-verde-claro" />
        </button>
      ) : role === "ADMIN" ? (
        <button onClick={() => navigateTo("/PanelAdmin")}>
          <FaUser className="text-verde-claro" />
        </button>
      ) : null
    ) : (
      <div>Loading...</div> // O algún otro mensaje o indicador de carga
    )
  ) : (
    <>
              <button
                onClick={() => navigateTo("/OptionUsers")}
                className="w-full bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600"
              >
                Iniciar sesión
              </button>

              <button
                onClick={() => navigateTo("/OptionUsers")}
                className="w-full mt-4 bg-white text-verde-oscuro px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Registrarse
              </button>
              </>
          )}
      
            </div>
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
          <div className="bg-verde-oscuro text-white text-lg p-4">
            <ul>
              <li
                onClick={() => navigateTo("/jobs")}
                className="px-4 py-2 hover:bg-green-200 hover:text-black rounded-md transition-all cursor-pointer"
              >
                Ofertas
              </li>
                    <li
                onClick={() => navigateTo("/News")}
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
                onClick={() => navigateTo("/Help")}
                className="px-4 py-2 hover:bg-green-200 hover:text-black rounded-md transition-all cursor-pointer"
              >
                ¿Cómo uso FC?
              </li>
              <li
                onClick={() => navigateTo("/cursos")}
                className="px-4 py-2 hover:bg-green-200 hover:text-black rounded-md transition-all cursor-pointer"
              >
               Entrenamiento
              </li>
              
              <li
                onClick={() => navigateTo("/Contact")}
                className="px-4 py-2 hover:bg-green-200 hover:text-black rounded-md transition-all cursor-pointer"
              >
                Contacto
              </li>
            </ul>

           
          </div>
        )}
      </nav>
    </>
  );
}

export default NavbarHome;
