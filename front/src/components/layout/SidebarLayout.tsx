"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AiOutlineFileAdd,
  AiOutlineFileText,
  AiOutlineUser,
} from "react-icons/ai";
import {
  FaBars,
  FaCog,
  FaDumbbell,
  FaEdit,
  FaEnvelope,
  FaExchangeAlt,
  FaHome,
  FaNewspaper,
  FaQuestionCircle,
  FaRocket,
  FaSearch,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import { getDefaultPlayerImage } from "@/helpers/imageUtils";
import { useUserContext } from "@/hook/useUserContext";
import { useVerificationStatus } from "@/hook/useVerificationStatus";
import HybridLanguageDropdown from "../LanguageToggle/HybridLanguageDropdown";
import I18nModeToggle from "../LanguageToggle/I18nModeToggle";
import NotificationsList from "../Notifications/NotificationsList";
import Navbar from "../navbar/navbar";
import NewNavbar from "../navbar/newNavbar";
import { useI18nMode } from "../Context/I18nModeContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";

interface NavbarSidebarLayoutProps {
  children: ReactNode;
}

interface SidebarItem {
  label: string;
  icon: ReactNode;
  path?: string;
  onClick?: () => void;
}

const NavbarSidebarLayout = ({ children }: NavbarSidebarLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLogged, role, setToken, setUser, user, logOut, token } =
    useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tNav = useNextIntlTranslations("navigation");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Función para obtener el texto traducido o el texto original
  const getText = (originalText: string, translatedKey: string) => {
    return isNextIntlEnabled ? tNav.t(translatedKey) : originalText;
  };

  const { verificationStatus, fetchVerificationStatus } =
    useVerificationStatus(token);

  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    hasActiveSubscription: boolean;
    subscriptionType: string;
  }>({
    hasActiveSubscription: false,
    subscriptionType: "Gratuito",
  });

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    logOut();
    router.push("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Esto es para obtener la subcripcion si eres manager y quieres buscar jugoderes verifica la suscriptcion
  useEffect(() => {
    const stored = localStorage.getItem("managerSubscriptionInfo");
    if (stored) {
      setSubscriptionInfo(JSON.parse(stored));
    }
  }, []);

  const handlePlayerSearchClick = () => {
    const hasPaidSubscription =
      subscriptionInfo.subscriptionType === "Profesional" ||
      subscriptionInfo.subscriptionType === "Semiprofesional";

    if (hasPaidSubscription && subscriptionInfo.hasActiveSubscription) {
      router.push("/player-search");
    } else {
      toast.error(
        "Necesitas una suscripción para acceder a la búsqueda de jugadores"
      );
      setTimeout(() => {
        router.push("/manager-subscription");
      }, 1000);
    }
  };

  // Generar items del sidebar según rol
  const getSidebarItems = (): {
    main: SidebarItem[];
    bottom: SidebarItem[];
    bottomNav: SidebarItem[];
  } => {
    // Panel para administradores
    if (role === "ADMIN") {
      return {
        main: [
          { label: getText("Inicio", "home"), path: "/", icon: <FaHome /> },
          {
            label: getText("Perfil", "profile"),
            path: "/PanelAdmin",
            icon: <FaUser />,
          },
          {
            label: getText("Buscar", "search"),
            path: "/player-search",
            icon: <FaSearch />,
          },
          {
            label: getText("Mercado", "market"),
            path: "/jobs",
            icon: <FaExchangeAlt />,
          },
          {
            label: getText("Noticias", "news"),
            path: "/News",
            icon: <FaNewspaper />,
          },
          {
            label: getText("Crear Noticia", "createNews"),
            path: "/PanelAdmin/News/crear-noticia",
            icon: <FaNewspaper />,
          },
          {
            label: getText("Entrenamiento", "training"),
            path: "/cursos",
            icon: <FaDumbbell />,
          },
          {
            label: getText("Crear Curso", "createCourse"),
            path: "/PanelAdmin/Cursos/crear-curso",
            icon: <FaDumbbell />,
          },
        ],
        bottom: [
          {
            label: getText("Configuración", "settings"),
            path: "/profile",
            icon: <MdSettings />,
          },
          {
            label: getText("Ayuda", "help"),
            path: "/Help",
            icon: <FaQuestionCircle />,
          },
          {
            label: getText("Mejorar Perfil", "improveProfile"),
            path: "/Subs",
            icon: <FaRocket />,
          },
        ],
        bottomNav: [
          {
            label: getText("Mercado", "market"),
            path: "/jobs",
            icon: <FaExchangeAlt />,
          },
          {
            label: getText("Editar", "editProfile"),
            path: "/profile",
            icon: <FaEdit />,
          },
          { label: getText("Inicio", "home"), path: "/", icon: <FaHome /> },
          {
            label: getText("Buscar", "search"),
            path: "/player-search",
            icon: <FaSearch />,
          },
          {
            label: getText("Perfil", "profile"),
            path: "/PanelAdmin",
            icon: <FaUser />,
          },
        ],
      };
    }

    if (role === "RECRUITER" || role === "CLUB" || role === "AGENCY") {
      return {
        main: [
          {
            label: getText("Mi Perfil", "myProfile"),
            path: "/PanelUsers/Manager",
            icon: <AiOutlineUser />,
          },
          {
            label: getText("Crear Oferta", "createOffer"),
            path: "/PanelUsers/Manager?section=createOffers",
            icon: <AiOutlineFileAdd />,
          },
          {
            label: getText("Mis Ofertas", "myOffers"),
            path: "/PanelUsers/Manager?section=appliedOffers",
            icon: <AiOutlineFileText />,
          },
          {
            label: getText("Portafolio", "portfolio"),
            path: "/PanelUsers/Manager?section=portfolio",
            icon: <FaUsers />,
          },
          {
            label: getText("Buscar Jugadores", "searchPlayers"),
            onClick: handlePlayerSearchClick,
            icon: <FaSearch />,
          },
          {
            label: getText("Mercado", "market"),
            path: "/jobs",
            icon: <FaExchangeAlt />,
          },
          {
            label: getText("Noticias", "news"),
            path: "/News",
            icon: <FaNewspaper />,
          },
        ],
        bottom: [
          {
            label: getText("Configuración", "settings"),
            path: "/PanelUsers/Manager?section=config",
            icon: <MdSettings />,
          },
          { label: getText("Ayuda", "help"), path: "/Help", icon: <FaQuestionCircle /> },
          {
            label: getText("Mejorar Plan", "improvePlan"),
            path: "/manager-subscription",
            icon: <FaRocket />,
          },
        ],
        bottomNav: [
          { label: getText("Mercado", "market"), path: "/jobs", icon: <FaExchangeAlt /> },
          {
            label: getText("Crear", "create"),
            path: "/PanelUsers/Manager?section=createOffers",
            icon: <AiOutlineFileAdd />,
          },
          { label: getText("Inicio", "home"), path: "/", icon: <FaHome /> },
          { label: getText("Buscar", "search"), path: "/player-search", icon: <FaSearch /> },
          { label: getText("Perfil", "profile"), path: "/PanelUsers/Manager", icon: <FaUser /> },
        ],
      };
    }

    // Sidebar para jugadores
    return {
      main: [
        { label: getText("Inicio", "home"), path: "/", icon: <FaHome /> },
        { label: getText("Perfil", "profile"), path: `/user-viewer/${user?.id}`, icon: <FaUser /> },
        {
          label: getText("Editar Perfil", "editProfile"),
          path: `/user-viewer/${user?.id}?edit=true`,
          icon: <FaEdit />,
        },
        { label: getText("Buscador", "search"), path: "/player-search", icon: <FaSearch /> },
        { label: getText("Mercado", "market"), path: "/jobs", icon: <FaExchangeAlt /> },
        { label: getText("Noticias", "news"), path: "/News", icon: <FaNewspaper /> },
        { label: getText("Entrenamiento", "training"), path: "/cursos", icon: <FaDumbbell /> },
      ],
      bottom: [
        {
          label: getText("Configuración", "settings"),
          path: `/forgotPassword?email=${encodeURIComponent(
            user?.email || ""
          )}`,
          icon: <FaCog />,
        },
        { label: getText("Ayuda", "help"), path: "/Help", icon: <FaQuestionCircle /> },
        { label: getText("Mejorar Perfil", "improveProfile"), path: "/Subs", icon: <FaRocket /> },
      ],
      bottomNav: [
        { label: getText("Mercado", "market"), path: "/jobs", icon: <FaExchangeAlt /> },
        {
          label: getText("Editar", "edit"),
          path: `/user-viewer/${user?.id}?edit=true`,
          icon: <FaEdit />,
        },
        { label: getText("Inicio", "home"), path: "/", icon: <FaHome /> },
        { label: getText("Buscar", "search"), path: "/player-search", icon: <FaSearch /> },
        { label: getText("Perfil", "profile"), path: `/user-viewer/${user?.id}`, icon: <FaUser /> },
      ],
    };
  };

  const sidebarItems = getSidebarItems();

  // Función para obtener el estado de verificación
  useEffect(() => {
    if (user?.id) {
      fetchVerificationStatus(user.id);
    }
  }, [user, fetchVerificationStatus]);

  // Función para obtener la imagen de avatar según el rol
  const getAvatarImage = () => {
    if (role === "RECRUITER") {
      return (
        user?.imgUrl ||
        (user?.genre === "Masculino"
          ? "/male-avatar.png"
          : user?.genre === "Femenino"
          ? "/female-avatar.png"
          : "/default-avatar.png")
      );
    }
    return user?.imgUrl || getDefaultPlayerImage(user?.genre);
  };

  // Función para obtener el borde del avatar según el rol y verificación
  const getAvatarBorder = () => {
    if (role === "RECRUITER") {
      return "border-green-500";
    }

    const isPlayer = user?.role?.toString() !== "RECRUITER";
    const level = verificationStatus?.verificationLevel;
    if (verificationStatus?.isVerified && isPlayer) {
      if (level === "PROFESSIONAL") return "border-yellow-500";
      if (level === "SEMIPROFESSIONAL") return "border-gray-400";
      return "border-gray-500";
    }
    return "border-gray-500";
  };

  // Función para obtener el nombre mostrado
  const getDisplayName = () => {
    if (role === "RECRUITER") {
      return user?.nameAgency || `${user?.name} ${user?.lastname}`;
    }
    return `${user?.name} ${user?.lastname}`;
  };

  return (
    <div className="flex flex-col min-h-screen bf-green-900">
      {/* Top Navbar - Solo desktop */}
      <div className="hidden md:block">{isLogged && <NewNavbar />}</div>

      {/* Mobile Top Bar */}
      {isLogged ? (
        <div className="md:hidden bg-green-700 text-white p-4 flex items-center justify-between sticky top-0 z-50">
          {/* Botón del sidebar a la izquierda */}
          <button
            onClick={toggleSidebar}
            className="text-white p-2"
            type="button"
          >
            <FaBars size={24} />
          </button>

          {/* Logo centrado */}
          <div className="flex-1 flex justify-start items-center">
            <span className="text-lg font-medium">FutboLink</span>
          </div>

          {/* Elementos a la derecha */}
          <div className="flex items-center space-x-3">
            <HybridLanguageDropdown />
            {/* Toggle para desarrollo - visible para testing */}
            <I18nModeToggle className="flex" showLabel={false} />
            <NotificationsList />
            <FaEnvelope className="text-gray-700" size={24} />
          </div>
        </div>
      ) : (
        <Navbar />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        {isLogged && (
          <aside className="hidden md:block group fixed top-0 left-0 h-screen z-20 transition-all duration-300 ease-in-out w-[72px] hover:w-[240px] bg-white border-r border-gray-200 px-4 py-8 pt-24 shadow-md  flex-col">
            {/* Desktop sidebar content - same as before */}
            <div>
              <div className="flex flex-col items-center mb-10">
                <div
                  className={`w-16 h-16 rounded-full overflow-hidden border-4 shadow-md ${getAvatarBorder()}`}
                >
                  <Image
                    src={getAvatarImage()}
                    alt={getDisplayName()}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <span className="mt-2 text-gray-800 text-sm font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-center">
                  {getDisplayName()}
                </span>
                <span
                  className={`mt-1 px-2 py-1 text-xs rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                    role === "RECRUITER"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {role === "RECRUITER" ? "Manager" : "Jugador"}
                </span>
              </div>

              <nav>
                <ul className="space-y-2">
                  {sidebarItems.main.map((item, index) => {
                    if (item.onClick) {
                      return (
                        <li key={`main-${item.label}-${index}`}>
                          <button
                            type="button"
                            onClick={item.onClick}
                            className="flex items-center gap-4 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              {item.label}
                            </span>
                          </button>
                        </li>
                      );
                    }

                    return (
                      <li key={`main-${item.path || item.label}-${index}`}>
                        <Link
                          href={item.path || "/"}
                          className="flex items-center gap-4 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
              {sidebarItems.bottom.map((item, index) => {
                return (
                  <Link
                    key={item.path || `bottom-${index}`}
                    href={item.path || "/"}
                    className={`flex items-center gap-4 px-3 py-2 rounded-lg text-sm font-medium transition-all ${"text-gray-700 hover:bg-gray-100"}`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.label}
                    </span>
                  </Link>
                );
              })}

              <hr className="border-t border-gray-200 my-4" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all w-full"
                type="button"
              >
                <FaSignOutAlt className="text-lg flex-shrink-0" />
                <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Cerrar sesión
                </span>
              </button>
            </div>
          </aside>
        )}

        {/* Mobile Sidebar Overlay */}
        {isLogged && isSidebarOpen && (
          <button
            type="button"
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeSidebar}
          ></button>
        )}

        {/* Mobile Sidebar */}
        {isLogged && (
          <aside
            className={`md:hidden fixed top-0 left-0 h-full w-80 bg-green-800 text-white transform transition-transform duration-300 ease-in-out z-50 ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Mobile sidebar header */}
            <div className="p-4 bg-green-900 flex items-center justify-between">
              <span className="text-lg font-semibold">Menu</span>
              <button
                onClick={closeSidebar}
                className="text-white p-2"
                type="button"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* User info */}
            <div className="p-6 bg-green-700">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 ${getAvatarBorder()}`}
                >
                  <Image
                    src={getAvatarImage()}
                    alt={getDisplayName()}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-white">{getDisplayName()}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      role === "RECRUITER"
                        ? "bg-green-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {role === "RECRUITER" ? "Manager" : "Player"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile menu items */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {sidebarItems.main.map((item, index) => {
                  if (item.onClick) {
                    return (
                      <li key={`main-${item.label}-${index}`}>
                        <button
                          type="button"
                          onClick={item.onClick}
                          className="flex items-center gap-4 px-3 py-2 rounded-lg text-sm font-medium text-white-700 hover:bg-gray-700 w-full text-left"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="whitespace-nowrap ">
                            {item.label}
                          </span>
                        </button>
                      </li>
                    );
                  }

                  return (
                    <li key={`main-${item.path || item.label}-${index}`}>
                      <Link
                        href={item.path || "/"}
                        onClick={closeSidebar}
                        className="flex items-center gap-4 px-4 py-2 rounded-lg text-sm font-medium text-white-300 hover:bg-gray-700 hover:text-white transition-all"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="whitespace-nowrap ">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 pt-4 border-t border-white-600">
                <ul className="space-y-1">
                  {sidebarItems.bottom.map((item, index) => (
                    <li key={item.path || `bottom-mobile-${index}`}>
                      <Link
                        href={item.path || "/"}
                        onClick={closeSidebar}
                        className="flex items-center gap-4 px-4 py-2 rounded-lg text-sm font-medium text-white-300 hover:bg-gray-700 hover:text-white transition-all"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-white-600">
                <button
                  onClick={() => {
                    handleLogout();
                    closeSidebar();
                  }}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-gray-700 transition-all w-full"
                  type="button"
                >
                  <FaSignOutAlt className="text-lg" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </nav>
          </aside>
        )}

        {/* Main content */}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isLogged
              ? "md:ml-[72px] md:group-hover:ml-[240px] bg-gray-50 pb-20 md:pb-0"
              : "bg-gray-50"
          }`}
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isLogged && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-green-800 border-t border-green-700 z-30">
          <div className="flex justify-around py-2">
            {sidebarItems.bottomNav.map((item, index) => {
              const isActive =
                pathname === item.path ||
                (item.path &&
                  item.path.includes("?section=") &&
                  pathname === item.path.split("?")[0]);
              return (
                <Link
                  key={item.path || `bottomNav-${index}`}
                  href={item.path || "/"}
                  className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 transition-colors ${
                    isActive
                      ? "text-green-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="text-xl mb-1">{item.icon}</span>
                  <span className="text-xs font-medium truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarSidebarLayout;
