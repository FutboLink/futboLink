"use client";

import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FaChevronDown,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaUserEdit,
  FaUsers,
} from "react-icons/fa";
import { useUserContext } from "@/hook/useUserContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";
import { useI18nMode } from "../Context/I18nModeContext";
import HybridLanguageDropdown from "../LanguageToggle/HybridLanguageDropdown";
import I18nModeToggle from "../LanguageToggle/I18nModeToggle";
import NextIntlLanguageSelector from "../LanguageToggle/NextIntlLanguageSelector";
import NotificationsList from "../Notifications/NotificationsList";

function NavbarRoles() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [hasProfessionalSubscription, setHasProfessionalSubscription] =
    useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const { isLogged, role, user, token, logOut } = useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tNav = useNextIntlTranslations("navigation");

  const getText = (originalText: string, translatedKey: string) => {
    return isNextIntlEnabled ? tNav.t(translatedKey) : originalText;
  };

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
            (subscriptionType === "Profesional" ||
              subscriptionType === "Semiprofesional") &&
              isActive
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

  const getRoleLabel = (): string => {
    if (role === "RECRUITER") return getText("Reclutador", "recruiter");
    if (role === "CLUB") return getText("Club", "club");
    if (role === "AGENCY") return getText("Agente", "agent");
    if (role === "PLAYER") return getText("Jugador", "player");
    if (role === "ADMIN") return getText("Administrador", "admin");
    return "";
  };

  const getInitials = (): string => {
    const first = user?.name?.charAt(0) ?? "";
    const last = user?.lastname?.charAt(0) ?? "";
    const initials = `${first}${last}`.toUpperCase();
    return initials || "U";
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

  const menuItems = [
    { label: "Ofertas", path: "/jobs" },
    { label: "Noticias", path: "/News" },
    { label: "Suscripciones", path: "/Subs" },
    { label: "Ayuda", path: "/Help" },
    { label: "Entrenamiento", path: "/cursos" },
    { label: "Contacto", path: "/contacto" },
  ];

  // Obtiene la ruta correcta según el rol y si el usuario está logueado
  const getUserPanelPath = (
    isLogged: boolean,
    role: string | null,
    id: string | undefined
  ): string => {
    if (!isLogged || !role) return "/"; // No logueado o sin rol → home

    if (role === "RECRUITER" || role === "CLUB" || role === "AGENCY") return "/PanelUsers/Manager"; // Reclutador, Club o Agencia siempre van al panel de gestión

    // Admin siempre va a PanelAdmin
    if (role === "ADMIN") return "/PanelAdmin";
    // Jugador: si hay id, a su perfil; si no, a su panel
    if (role === "PLAYER")
      return id ? `/user-viewer/${id}` : "/PanelUsers/Player";

    return "/";
  };

  // Renderiza botón con texto y ruta según rol
  const renderUserIcon = () => {
    if (!isLogged || !role) return null;

    const targetPath = getUserPanelPath(isLogged, role, user?.id);
    const isRecruiter = role === "RECRUITER" || role === "CLUB" || role === "AGENCY";
    const isAdmin = role === "ADMIN";

    return (
      <button
        type="button"
        onClick={() => navigateTo(targetPath)}
        className="flex items-center gap-2 px-4 py-2 bg-verde-oscuro text-white rounded-md hover:bg-verde-mas-claro transition-all whitespace-nowrap"
      >
        <FaUser className="text-lg" />
        <span className="font-medium">
          {isRecruiter
            ? "Panel de Gestión"
            : isAdmin
            ? "Panel Admin"
            : "Perfil"}
        </span>
      </button>
    );
  };

  const targetPath = getUserPanelPath(isLogged, role, user?.id);

  // Renderizar botón de búsqueda de jugadores para móviles
  const renderPlayerSearchButton = () => {
    // Permitir acceso a profesionales y semiprofesionales
    if (
      !hasProfessionalSubscription &&
      role !== "RECRUITER" &&
      role !== "ADMIN"
    )
      return null;

    return (
      <button
        type="button"
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

            <ul className="hidden md:flex gap-6 text-lg text-verde-oscuro">
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
          <div className="hidden md:flex ml-auto items-center gap-4">
            {isLogged && (
              <>
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-50 transition-colors"
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
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm">
                        {getInitials()}
                      </div>
                    )}
                    <div className="flex flex-col items-start leading-tight">
                      <span className="font-semibold text-gray-800 text-sm">
                        {user?.name ?? ""}
                      </span>
                      <span className="font-semibold text-gray-800 text-sm">
                        {user?.lastname ?? ""}
                      </span>
                      <span className="text-xs text-emerald-600 font-medium">
                        {(user as unknown as { puesto?: string })?.puesto || getRoleLabel()}
                      </span>
                    </div>
                    <FaChevronDown
                      className="text-gray-500 ml-1"
                      size={12}
                    />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-100 py-2 w-48 z-50">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          router.push(getEditProfilePath());
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"
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
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"
                      >
                        <FaCog className="text-gray-500" />
                        <span>
                          {getText("Configuración", "profileMenuSettings")}
                        </span>
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        type="button"
                        onClick={handleProfileLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50"
                      >
                        <FaSignOutAlt className="text-gray-500" />
                        <span>
                          {getText("Cerrar Sesión", "profileMenuLogout")}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="h-8 w-px bg-gray-200" />
              </>
            )}
            {/* Language Dropdown */}
            <HybridLanguageDropdown />
            {/* Next-Intl Language Selector */}
            <NextIntlLanguageSelector />
            {/* i18n Mode Toggle */}
            <I18nModeToggle showLabel={true} />

            {!isLogged && (
              <>
                <Link href={"/Login"}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-verde-oscuro rounded-xl hover:shadow-md transition-all duration-200"
                    
                  >
                    Iniciar sesión
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={() => navigateTo("/Login/register")}
                  className="px-5 py-2.5 bg-verde-oscuro text-white rounded-xl hover:bg-green-800 hover:shadow-lg transition-all duration-200 m-0"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>

          {/* Icono de usuario y notificaciones en escritorio */}
          <div className="hidden md:flex items-center gap-4">
            {isLogged && <NotificationsList />}
            {isLogged && renderPlayerSearchButton()}
            {renderUserIcon()}
          </div>

          {/* Menú móvil: hamburguesa + ícono de usuario + notificaciones */}
          <div className="flex items-center justify-end space-x-3 md:hidden">
            {/* Language Dropdown (Mobile) */}
            <HybridLanguageDropdown />
            {/* Next-Intl Language Selector (Mobile) */}
            <NextIntlLanguageSelector />
            {/* i18n Mode Toggle (Mobile) */}
            <I18nModeToggle showLabel={false} />

            {isLogged && (
              <>
                <NotificationsList />
                <div className="flex-shrink-0">{renderUserIcon()}</div>
              </>
            )}
            <button
              type="button"
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

        {/* Menú móvil: mostrar los botones de sesión solo cuando el menú móvil está abierto */}
        {isMobileMenuOpen && (
          <div
            className={`absolute top-0 left-0 w-full bg-white text-verde-oscuro text-lg p-4 mt-20 shadow-md transform transition-transform duration-300 ease-in-out md:hidden z-50
          ${
            isMobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0"
          }`}
          >
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
                      type="button"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600"
                    >
                      Iniciar sesión
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => navigateTo("/Login/register")}
                    className="w-full bg-white text-verde-oscuro px-4 py-2 rounded-md mt-2 hover:bg-gray-200"
                  >
                    Registrarse
                  </button>
                </>
              ) : (
                <div className="mb-4 mt-2 border-t pt-4 border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Tu cuenta</p>
                  <button
                    type="button"
                    onClick={() => navigateTo(targetPath)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-verde-oscuro text-white rounded-md hover:bg-verde-mas-claro transition-all"
                  >
                    <FaUser className="text-lg" />
                    <span className="font-medium">
                      {role === "ADMIN" ? "Ir a mi Panel" : "Ir a mi Perfil"}
                    </span>
                  </button>

                  {/* Botón de búsqueda de jugadores para usuarios con suscripción profesional o RECRUITERS */}
                  {(hasProfessionalSubscription || role === "RECRUITER") && (
                    <button
                      type="button"
                      onClick={() => navigateTo("/player-search")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all mt-2"
                    >
                      <FaUsers size={18} className="text-white" />
                      <span className="font-medium">Búsqueda de Jugadores</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default NavbarRoles;
