"use client";

import { useState, useRef, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import { UserContext } from "../Context/UserContext";
import { FaUser } from "react-icons/fa";

function NavbarRoles() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isLogged, role } = useContext(UserContext);

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
        <title>FutboLink - Ofertas, Cursos, Noticias y Más</title>
        <meta
          name="description"
          content="Encuentra ofertas de futbol, cursos de formación, noticias y más con FutboLink. Regístrate o inicia sesión para empezar."
        />
        <meta name="robots" content="index, follow" />
      </Head>

      <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
        <section className="flex items-center justify-between py-2 px-4">
          {/* Sección izquierda con logo y links */}
          <div id="sectionOne" className="flex items-center gap-6">
            <Link href={"/"}>
              <Image
                src="/logoD.png"
                height={60}
                width={60}
                alt="FutboLink logo"
                className="rounded-2xl"
              />
            </Link>

            {/* Menú para escritorio */}
            <ul className="hidden sm:flex gap-6 text-lg text-verde-oscuro">
              <li
                onClick={() => navigateTo("/jobs")}
                className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
                aria-label="Ofertas de empleo"
              >
                Ofertas
              </li>
              <li
                onClick={() => navigateTo("/Formation")}
                className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
                aria-label="Entrenamiento en futbol"
              >
                Entrenamiento
              </li>
              <li
                onClick={() => navigateTo("/News")}
                className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
                aria-label="Noticias relacionadas con futbol"
              >
                Noticias
              </li>
              <li
                onClick={() => navigateTo("/Subs")}
                className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
                aria-label="Suscripciones"
              >
                Suscripciones
              </li>
              <li
                onClick={() => navigateTo("/Contact")}
                className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
                aria-label="Contacto"
              >
                Contacto
              </li>
              <li
                onClick={() => navigateTo("/Help")}
                className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
                aria-label="Cómo usar FutboLink"
              >
                Ayuda
              </li>
              <li
                onClick={() => navigateTo("/cursos")}
                className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
                aria-label="Cómo usar FutboLink"
              >
               Entrenamiento
              </li>
            </ul>
          </div>

          <div id="sectionTwo" className="relative hidden sm:flex">
            {isLogged ? (
              role ? ( // Verifica si `role` tiene un valor antes de renderizar
                role === "PLAYER" ? (
                  <button onClick={() => navigateTo("/PanelUsers/Player")}>
                    <FaUser className="text-verde-oscuro text-2xl hover:text-verde-claro transition-all hover:transition-all hover:scale-150" />
                  </button>
                ) : role === "RECRUITER" ? (
                  <button onClick={() => navigateTo("/PanelUsers/Manager")}>
                    <FaUser className="text-verde-oscuro text-2xl hover:text-verde-claro transition-all hover:transition-all hover:scale-150" />
                  </button>
                ) : role === "ADMIN" ? (
                  <button onClick={() => navigateTo("/PanelAdmin")}>
                    <FaUser className="text-verde-oscuro text-2xl hover:text-verde-claro transition-all hover:transition-all hover:scale-150" />
                  </button>
                ) : null
              ) : (
                <div>Loading...</div>
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

          {/* Menú Hamburguesa en pantallas pequeñas */}
          <button
            onClick={toggleMobileMenu}
            className="sm:hidden text-verde-oscuro focus:outline-none"
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
          <div className="sm:hidden bg-white text-verde-oscuro text-lg p-4">
            <ul>
              <li
                onClick={() => navigateTo("/jobs")}
                className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
              >
                Ofertas
              </li>
                <li
                onClick={() => navigateTo("/News")}
                className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
              >
                Noticias
              </li>
              <li
                onClick={() => navigateTo("/Subs")}
                className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
              >
                Suscripciones
              </li>
              <li
                onClick={() => navigateTo("/Contact")}
                className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
              >
                Contacto
              </li>
              <li
                onClick={() => navigateTo("/Help")}
                className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
              >
                Ayuda
              </li>
              <li
                onClick={() => navigateTo("/cursos")}
                className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
              >
              Entrenamiento
              </li>
            </ul>

            <div className="mt-4">
              {isLogged ? (
                role ? ( // Verifica si `role` tiene un valor antes de renderizar
                  role === "PLAYER" ? (
                    <button onClick={() => navigateTo("/PanelUsers/Player")}>
                      <FaUser className="text-verde-oscuro" />
                    </button>
                  ) : role === "RECRUITER" ? (
                    <button onClick={() => navigateTo("/PanelUsers/Manager")}>
                      <FaUser className="text-verde-claro hover:text-verde-mas-claro hover:scale-110" />
                    </button>
                  ) : role === "ADMIN" ? (
                    <button onClick={() => navigateTo("/PanelAdmin")}>
                      <FaUser className="text-verde-claro hover:text-verde-mas-claro hover:scale-110" />
                    </button>
                  ) : null
                ) : (
                  <div>Loading...</div> // O algún otro mensaje o indicador de carga
                )
              ) : (
                <>
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
                    className="w-full bg-white text-verde-oscuro px-4 py-2 rounded-md mt-2 hover:bg-gray-200"
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

export default NavbarRoles;
