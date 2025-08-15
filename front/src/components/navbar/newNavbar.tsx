"use client";

import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { UserContext } from "../Context/UserContext";
import LanguageDropdown from "../LanguageToggle/LanguageDropdown";
import NotificationsList from "../Notifications/NotificationsList";

function newNavbar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasProfessionalSubscription, setHasProfessionalSubscription] =
    useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isLogged, user, token } = useContext(UserContext);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const navigateTo = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  // Verificar si el usuario tiene suscripción profesional
  useEffect(() => {
    if (isLogged && user && token) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}/subscription`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          const { subscriptionType, isActive } = response.data;
          setHasProfessionalSubscription(
            subscriptionType === "Profesional" && isActive
          );
        })
        .catch((error) => {
          console.error("Error al verificar suscripción:", error);
        });
    }
  }, [isLogged, user, token]);

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

      <nav className="sticky top-0 left-0 w-full z-50 bg-white shadow-md">
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
          </div>

          {/* Language dropdown and login buttons */}
          <div className="hidden md:flex ml-auto items-center gap-4">
            {/* Language Dropdown */}
            <LanguageDropdown />

            {!isLogged && (
              <>
                <Link href={"/Login"}>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600"
                    type="button"
                  >
                    Iniciar sesión
                  </button>
                </Link>
                <button
                  onClick={() => navigateTo("/OptionUsers")}
                  className="px-4 py-2 bg-white text-verde-oscuro rounded-md  hover:bg-gray-200 m-0"
                  type="button"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>

          {/* Icono de usuario y notificaciones en escritorio */}
          <div className="hidden md:flex items-center gap-4">
            {isLogged && <NotificationsList />}
            {isLogged && <FaEnvelope className="text-gray-700" size={24} />}
          </div>

          {/* Menú móvil: hamburguesa + ícono de usuario + notificaciones */}
          <div className="flex items-center justify-end space-x-3 md:hidden">
            {/* Language Dropdown (Mobile) */}
            <LanguageDropdown />

            {isLogged && <NotificationsList />}
            <button
              onClick={toggleMobileMenu}
              className="text-verde-oscuro focus:outline-none p-1"
              aria-label="Abrir menú móvil"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-8 w-8"
                aria-hidden="true"
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
      </nav>
    </>
  );
}

export default newNavbar;
