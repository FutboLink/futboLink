"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import {
  FaChevronDown,
  FaCog,
  FaEnvelope,
  FaSignOutAlt,
  FaUserEdit,
} from "react-icons/fa";
import { UserContext } from "../Context/UserContext";
import HybridLanguageDropdown from "../LanguageToggle/HybridLanguageDropdown";
import I18nModeToggle from "../LanguageToggle/I18nModeToggle";
import NextIntlLanguageSelector from "../LanguageToggle/NextIntlLanguageSelector";
import NotificationsList from "../Notifications/NotificationsList";
import { useI18nMode } from "../Context/I18nModeContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";

function newNavbar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [hasProfessionalSubscription, setHasProfessionalSubscription] =
    useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const { isLogged, user, token, role, logOut } = useContext(UserContext);
  const { isNextIntlEnabled } = useI18nMode();
  const tNav = useNextIntlTranslations('navigation');

  // Función para obtener el texto traducido o el texto original
  const getText = (originalText: string, translatedKey: string) => {
    return isNextIntlEnabled ? tNav.t(translatedKey) : originalText;
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const navigateTo = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const getInitials = (): string => {
    const first = user?.name?.charAt(0) ?? "";
    const last = user?.lastname?.charAt(0) ?? "";
    const initials = `${first}${last}`.toUpperCase();
    return initials || "U";
  };

  const getRoleLabel = (): string => {
    if (role === "RECRUITER") return getText("Reclutador", "recruiter");
    if (role === "CLUB") return getText("Club", "club");
    if (role === "AGENCY") return getText("Agente", "agent");
    if (role === "PLAYER") return getText("Jugador", "player");
    if (role === "ADMIN") return getText("Administrador", "admin");
    return "";
  };

  const getEditProfilePath = (): string => {
    // PLAYER, AGENCY, RECRUITER y CLUB editan en la MISMA vista pública
    // (user-viewer) en modo edición. Así no salta del perfil nuevo al panel
    // viejo de gestión al tocar "Editar Perfil". El modo edición de esa vista
    // (?edit=true) no está atado al rol: renderiza ProfileUser para cualquier
    // dueño, igual que /profile. Mis Ofertas / Crear Oferta / Portafolio siguen
    // en las tabs de esa misma vista. La Configuración (cambio de contraseña,
    // suscripción) sigue yendo al panel vía getSettingsPath.
    if (
      (role === "PLAYER" ||
        role === "RECRUITER" ||
        role === "CLUB" ||
        role === "AGENCY") &&
      user?.id
    ) {
      return `/user-viewer/${user.id}?edit=true`;
    }
    if (role === "RECRUITER" || role === "CLUB" || role === "AGENCY") {
      return "/PanelUsers/Manager";
    }
    return "/profile";
  };

  const getSettingsPath = (): string => {
    if (role === "PLAYER") {
      return `/forgotPassword?email=${encodeURIComponent(user?.email || "")}`;
    }
    if (role === "RECRUITER" || role === "CLUB" || role === "AGENCY") {
      return "/PanelUsers/Manager?section=config";
    }
    return "/profile";
  };

  const handleProfileLogout = () => {
    setIsProfileDropdownOpen(false);
    logOut();
    router.push("/");
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
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

          {/* Icono de usuario y notificaciones en escritorio */}
          <div className="hidden md:flex ml-auto items-center gap-4">
            {/* Language Dropdown */}
            <HybridLanguageDropdown />
            {/* i18n Mode Toggle */}
            <I18nModeToggle showLabel={true} />
            {/* Next-Intl Language Selector */}
            <NextIntlLanguageSelector />
            {isLogged && (
              <>
                <div className="h-6 w-px bg-gray-200" />
                <NotificationsList />
                <FaEnvelope className="text-gray-700" size={24} />
                <div className="h-6 w-px bg-gray-200" />
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    aria-expanded={isProfileDropdownOpen}
                    aria-label={getText("Menú de perfil", "profileMenu")}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-gray-100 hover:shadow-sm transition-all ${isProfileDropdownOpen ? "bg-gray-100 shadow-sm" : ""}`}
                  >
                    {user?.imgUrl ? (
                      <Image
                        src={user.imgUrl}
                        alt={`${user?.name ?? ""} ${user?.lastname ?? ""}`.trim() || "Usuario"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div translate="no" className="notranslate w-10 h-10 rounded-full bg-verde-oscuro text-white flex items-center justify-center font-semibold text-sm uppercase">
                        {getInitials()}
                      </div>
                    )}
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[160px]">
                        {`${user?.name ?? ""} ${user?.lastname ?? ""}`.trim()}
                      </span>
                      <span className="text-xs text-emerald-600 font-medium truncate max-w-[160px]">
                        {(user as unknown as { puesto?: string })?.puesto ||
                          getRoleLabel()}
                      </span>
                    </div>
                    <FaChevronDown
                      className={`text-gray-500 ml-1 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                      size={12}
                    />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 py-2 w-52 z-50"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            router.push(getEditProfilePath());
                          }}
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 mx-1 rounded-md text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                        >
                          <FaUserEdit className="text-gray-500" />
                          <span>
                            {getText("Editar Perfil", "profileMenuEdit")}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            router.push(getSettingsPath());
                          }}
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 mx-1 rounded-md text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                        >
                          <FaCog className="text-gray-500" />
                          <span>
                            {getText("Configuración", "profileMenuSettings")}
                          </span>
                        </button>
                        <div className="border-t border-gray-100 mx-2 my-1" />
                        <button
                          type="button"
                          onClick={handleProfileLogout}
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 mx-1 rounded-md text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <FaSignOutAlt className="text-red-500" />
                          <span>
                            {getText("Cerrar Sesión", "profileMenuLogout")}
                          </span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {!isLogged && (
              <>
                <Link href={"/Login"}>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600"
                    type="button"
                  >
                    {getText("Iniciar sesión", "login")}
                  </button>
                </Link>
                <button
                  onClick={() => navigateTo("/OptionUsers")}
                  className="px-4 py-2 bg-white text-verde-oscuro rounded-md  hover:bg-gray-200 m-0"
                  type="button"
                >
                  {getText("Registrarse", "register")}
                </button>
              </>
            )}
          </div>

          {/* Menú móvil: hamburguesa + ícono de usuario + notificaciones */}
          <div className="flex items-center justify-end space-x-3 md:hidden">
            {/* Language Dropdown (Mobile) */}
            <HybridLanguageDropdown />
            {/* Next-Intl Language Selector (Mobile) */}
            <NextIntlLanguageSelector />
            {/* i18n Mode Toggle (Mobile) */}
            <I18nModeToggle showLabel={false} />

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
