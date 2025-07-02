"use client";

import { useState, useRef, useEffect, useContext } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import { UserContext } from "../Context/UserContext";
import { FaUser, FaSearch, FaUsers, FaNetworkWired } from "react-icons/fa";
import LanguageDropdown from "../LanguageToggle/LanguageDropdown";
import NotificationsList from "../Notifications/NotificationsList";
import axios from "axios";

function NavbarRoles() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasProfessionalSubscription, setHasProfessionalSubscription] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isLogged, role, user, token } = useContext(UserContext);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const navigateTo = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  // Verificar si el usuario tiene suscripción profesional
  useEffect(() => {
    if (isLogged && user && token) {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}/subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          const { subscriptionType, isActive } = response.data;
          setHasProfessionalSubscription(subscriptionType === 'Profesional' && isActive);
        })
        .catch(error => {
          console.error('Error al verificar suscripción:', error);
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

  const menuItems = [
    { label: "Ofertas", path: "/jobs" },
    { label: "Noticias", path: "/News" },
    { label: "Suscripciones", path: "/Subs" },
    { label: "Ayuda", path: "/Help" },
    { label: "Entrenamiento", path: "/cursos" },
    { label: "Contacto", path: "/contacto" },
  ];

  const renderUserIcon = () => {
    if (!isLogged || !role) return null;

    let targetPath = "";
    if (role === "PLAYER") targetPath = "/PanelUsers/Player";
    else if (role === "RECRUITER") targetPath = "/PanelUsers/Manager";
    else if (role === "ADMIN") targetPath = "/PanelAdmin";

    // Si el usuario está autenticado, mostrar su perfil
    if (user && user.id) {
      // Para RECRUITER, redirigir al panel de gestión
      if (role === "RECRUITER") {
        return (
          <button 
            onClick={() => navigateTo("/PanelUsers/Manager")}
            className="flex items-center gap-2 px-4 py-2 bg-verde-oscuro text-white rounded-md hover:bg-verde-mas-claro transition-all whitespace-nowrap"
          >
            <FaUser className="text-lg" />
            <span className="font-medium">Panel de Gestión</span>
          </button>
        );
      }
      
      // Para otros roles, mantener el comportamiento actual
      return (
        <button 
          onClick={() => navigateTo(`/user-viewer/${user.id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-verde-oscuro text-white rounded-md hover:bg-verde-mas-claro transition-all whitespace-nowrap"
        >
          <FaUser className="text-lg" />
          <span className="font-medium">Perfil</span>
        </button>
      );
    }

    // Fallback al panel genérico si no hay ID de usuario
    return (
      <button 
        onClick={() => navigateTo(targetPath)}
        className="flex items-center gap-2 px-4 py-2 bg-verde-oscuro text-white rounded-md hover:bg-verde-mas-claro transition-all whitespace-nowrap"
      >
        <FaUser className="text-lg" />
        <span className="font-medium">Perfil</span>
      </button>
    );
  };

  // Renderizar botón de búsqueda de jugadores para móviles
  const renderPlayerSearchButton = () => {
    if (!hasProfessionalSubscription) return null;

    return (
      <button 
        onClick={() => navigateTo("/player-search")}
        className="flex items-center gap-2 px-4 py-2 border-2 border-verde-oscuro text-verde-oscuro rounded-md hover:bg-green-700 transition-all whitespace-nowrap"
      >
        <FaUsers size={18} className="text-black" />
        <span className="font-medium">Mi red</span>
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

            <ul className="hidden sm:flex gap-6 text-lg text-verde-oscuro">
              {menuItems.map((item) => (
                <li
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Language dropdown and login buttons */}
          <div className="hidden sm:flex ml-auto items-center gap-4">
            {/* Language Dropdown */}
            <LanguageDropdown />

            {!isLogged && (
              <>
                <Link href={"/Login"}>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600"
                  >
                    Iniciar sesión
                  </button>
                </Link>
                <button
                  onClick={() => navigateTo("/OptionUsers")}
                  className="px-4 py-2 bg-white text-verde-oscuro rounded-md mt-2 hover:bg-gray-200"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>

          {/* Icono de usuario y notificaciones en escritorio */}
          <div className="hidden sm:flex items-center gap-4">
            {isLogged && <NotificationsList />}
            {isLogged && hasProfessionalSubscription && renderPlayerSearchButton()}
            {renderUserIcon()}
          </div>

          {/* Menú móvil: hamburguesa + ícono de usuario + notificaciones */}
          <div className="flex items-center justify-end space-x-3 sm:hidden">
            {/* Language Dropdown (Mobile) */}
            <LanguageDropdown />
            
            {isLogged && (
              <>
                <NotificationsList />
              <div className="flex-shrink-0">
                {renderUserIcon()}
              </div>
              </>
            )}
            <button
              onClick={toggleMobileMenu}
              className="text-verde-oscuro focus:outline-none p-1"
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

        {/* Menú móvil: mostrar los botones de sesión solo cuando el menú móvil está abierto */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white text-verde-oscuro text-lg p-4">
            <ul>
              {menuItems.map((item) => (
                <li
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  className="px-4 py-2 hover:bg-verde-oscuro hover:text-white rounded-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {item.label}
                </li>
              ))}
            </ul>

            <div className="mt-4">
              {!isLogged ? (
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
              ) : (
                <>
                  <div className="mb-4 mt-2 border-t pt-4 border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Tu cuenta</p>
                    <button
                      onClick={() => {
                        let targetPath = "";
                        if (role === "PLAYER") targetPath = "/PanelUsers/Player";
                        else if (role === "RECRUITER") targetPath = "/PanelUsers/Manager";
                        else if (role === "ADMIN") targetPath = "/PanelAdmin";
                        navigateTo(targetPath);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-verde-oscuro text-white rounded-md hover:bg-verde-mas-claro transition-all"
                    >
                      <FaUser className="text-lg" />
                      <span className="font-medium">Ir a mi Perfil</span>
                    </button>
                    
                    {/* Botón de búsqueda de jugadores para usuarios con suscripción profesional o RECRUITERS */}
                    {(hasProfessionalSubscription || role === "RECRUITER") && (
                      <button
                        onClick={() => navigateTo("/player-search")}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all mt-2"
                      >
                        <FaUsers size={18} className="text-white" />
                        <span className="font-medium">Búsqueda de Jugadores</span>
                      </button>
                    )}
                  </div>
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
