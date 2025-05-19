"use client";

import { useState, useRef, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import { UserContext } from "../Context/UserContext";
import { FaUser } from "react-icons/fa";

function NavbarAdmin() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isLogged, role } = useContext(UserContext);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const navigateTo = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: "Ofertas", path: "/jobs" },
    { label: "Noticias", path: "/PanelAdmin/News" },
    { label: "Suscripciones", path: "/Subs" },
    { label: "Ayuda", path: "/Help" },
    { label: "Entrenamiento", path: "/PanelAdmin/Cursos" },
    { label: "Contacto", path: "/Contact" },
  ];

  const renderUserIcon = () => {
    if (!isLogged || !role) return null;

    let targetPath = "";
    if (role === "ADMIN") targetPath = "/PanelAdmin";

    return (
      <button
        className="w-[1.5rem] h-[1.5rem]"
        onClick={() => navigateTo(targetPath)}
      >
        <FaUser className="w-full h-full text-verde-oscuro hover:text-verde-mas-claro hover:scale-110" />
      </button>
    );
  };

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
          {/* Logo + Menú escritorio */}
          <div className="flex items-center gap-6">
            <Link href={"/"}>
              <Image
                src="/logoD.png"
                height={60}
                width={60}
                alt="FutboLink logo"
                className="rounded-2xl"
              />
            </Link>

            <ul className="hidden lg:flex gap-6 text-lg text-verde-oscuro">
              {menuItems.map((item) => (
                <li
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
                >
                  {item.label}
                </li>
              ))}
            </ul>

            {/* Botones de sesión fuera del loop */}
            <div>
              {!isLogged && (
                <>
                  <Link href={"/Login"}>
                    <button
                      onClick={() => setIsDropdownOpen(false)}
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

          {/* Icono de usuario en escritorio */}
          <div className="hidden lg:flex items-center gap-4">
            {renderUserIcon()}
          </div>

          {/* Menú móvil: hamburguesa + ícono de usuario */}
          <div className="flex items-center gap-4 lg:hidden">
            {renderUserIcon()}
            <button
              onClick={toggleMobileMenu}
              className="text-verde-oscuro focus:outline-none"
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
          </div>
        </section>

        {/* Menú desplegable móvil */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white text-verde-oscuro text-lg p-4">
            <ul>
              {menuItems.map((item) => (
                <li
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer"
                >
                  {item.label}
                </li>
              ))}
            </ul>

            <div className="mt-4">
              {!isLogged && (
                <>
                  <Link href={"/Login"}>
                    <button
                      onClick={() => setIsDropdownOpen(false)}
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

export default NavbarAdmin;