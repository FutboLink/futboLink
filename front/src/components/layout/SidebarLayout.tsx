"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  AiOutlineFileAdd,
  AiOutlineFileText,
  AiOutlineUser,
} from "react-icons/ai";
import {
  FaBars,
  FaBriefcase,
  FaChevronDown,
  FaCog,
  FaDumbbell,
  FaEdit,
  FaEnvelope,
  FaExchangeAlt,
  FaHome,
  FaNewspaper,
  FaPlus,
  FaQuestionCircle,
  FaRegCreditCard,
  FaRegFileAlt,
  FaRocket,
  FaSearch,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaUserEdit,
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
  children?: SidebarItem[];
}

const NavbarSidebarLayout = ({ children }: NavbarSidebarLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLogged, role, setToken, setUser, user, logOut, token } =
    useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tNav = useNextIntlTranslations("navigation");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownMobileOpen, setIsProfileDropdownMobileOpen] =
    useState(false);
  const profileDropdownMobileRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const toggleSection = (label: string) =>
    setExpandedSections((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label],
    );
  const isSectionExpanded = (label: string) => expandedSections.includes(label);

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
    subscription: SidebarItem | null;
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
          {
            label: getText("Páginas", "pagesMenu"),
            icon: <FaRegFileAlt />,
            children: [
              {
                label: getText("Crear Página", "createPage"),
                path: "/pages/create",
                icon: <FaRegFileAlt />,
              },
              {
                label: getText("Mis páginas", "myPages"),
                path: "/pages/mine",
                icon: <FaRegFileAlt />,
              },
              {
                label: getText("Todas las páginas", "allPages"),
                path: "/admin/pages/all",
                icon: <FaRegFileAlt />,
              },
              {
                label: getText("Pendientes", "pendingPages"),
                path: "/admin/pages/pending",
                icon: <FaRegFileAlt />,
              },
            ],
          },
        ],
        subscription: {
          label: getText("Administrar Suscripción", "manageSubscription"),
          onClick: () => window.open("https://billing.stripe.com/p/login/28E00j1FVcrleEBayigbm00", "_blank"),
          icon: <FaRegCreditCard />,
        },
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

    // Cliente confirmó: TODOS los PLAYER (cualquier puesto) ven el sidebar
    // del Futbolista. El Cuerpo Técnico publica ofertas vía tabs propias
    // dentro de su user-viewer, no desde el sidebar del agente.
    const isFutbolista = role === "PLAYER";

    if (!isFutbolista) {
      return {
        main: [
          {
            // Para AGENCY / RECRUITER / CLUB el perfil pasa a verse en
            // /user-viewer/{id} (misma estructura que Futbolista y CT,
            // con tab "Portafolio" extra). El panel del agente legacy
            // queda solo como vista de respaldo para crear/listar ofertas
            // si alguien llega por URL directa.
            label: getText("Mi Perfil", "myProfile"),
            path: user?.id ? `/user-viewer/${user.id}` : "/PanelUsers/Manager",
            icon: <AiOutlineUser />,
          },
          {
            // El editor unificado del 1B vive en user-viewer/{id}?edit=true.
            // Para el agente carga PersonalInfo (sin Posiciones ni Datos
            // Físicos porque role != PLAYER+Jugador) y guarda los campos
            // de agencia (Año de fundación, etc.).
            label: getText("Editar Perfil", "editProfile"),
            path: user?.id
              ? `/user-viewer/${user.id}?edit=true`
              : "/PanelUsers/Manager",
            icon: <FaEdit />,
          },
          {
            label: getText("Crear Oferta", "createOffer"),
            path: user?.id
              ? `/user-viewer/${user.id}?tab=createOffer`
              : "/PanelUsers/Manager?section=createOffers",
            icon: <AiOutlineFileAdd />,
          },
          {
            label: getText("Páginas", "pagesMenu"),
            icon: <FaRegFileAlt />,
            children: [
              {
                label: getText("Crear Página", "createPage"),
                path: "/pages/create",
                icon: <FaRegFileAlt />,
              },
              {
                label: getText("Mis páginas", "myPages"),
                path: "/pages/mine",
                icon: <FaRegFileAlt />,
              },
              ...(role === "ADMIN"
                ? [
                    {
                      label: getText("Pendientes", "pendingPages"),
                      path: "/admin/pages/pending",
                      icon: <FaRegFileAlt />,
                    },
                  ]
                : []),
            ],
          },
          {
            label: getText("Mis Ofertas", "myOffers"),
            path: user?.id
              ? `/user-viewer/${user.id}?tab=myOffers`
              : "/PanelUsers/Manager?section=appliedOffers",
            icon: <AiOutlineFileText />,
          },
          {
            label: getText("Portafolio", "portfolio"),
            path: user?.id
              ? `/user-viewer/${user.id}?tab=portfolio`
              : "/PanelUsers/Manager?section=portfolio",
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
        subscription: {
          label: getText("Administrar Suscripción", "manageSubscription"),
          onClick: () => window.open("https://billing.stripe.com/p/login/28E00j1FVcrleEBayigbm00", "_blank"),
          icon: <FaRegCreditCard />,
        },
        bottom: [
          {
            label: getText("Configuración", "settings"),
            path: "/PanelUsers/Manager?section=config",
            icon: <MdSettings />,
          },
          {
            label: getText("Ayuda", "help"),
            path: "/Help",
            icon: <FaQuestionCircle />,
          },
          {
            label: getText("Mejorar Plan", "improvePlan"),
            path: "/manager-subscription",
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
            label: getText("Crear", "create"),
            path: "/PanelUsers/Manager?section=createOffers",
            icon: <AiOutlineFileAdd />,
          },
          { label: getText("Inicio", "home"), path: "/", icon: <FaHome /> },
          {
            label: getText("Buscar", "search"),
            path: "/player-search",
            icon: <FaSearch />,
          },
          {
            label: getText("Perfil", "profile"),
            path: "/PanelUsers/Manager",
            icon: <FaUser />,
          },
        ],
      };
    }

    // Sidebar para jugadores
    // El Cuerpo Técnico / Dirección (PLAYER + puesto != "jugador") puede
    // publicar ofertas. Las gestiona vía tabs dentro de su propio
    // user-viewer (?tab=myOffers / ?tab=createOffer), así no necesitamos
    // un sidebar paralelo al del agente.
    const puestoLowerForOffers = (user?.puesto || "").toLowerCase();
    const canPublishOffersFromSidebar =
      role === "PLAYER" &&
      puestoLowerForOffers !== "" &&
      puestoLowerForOffers !== "jugador";

    return {
      main: [
        { label: getText("Inicio", "home"), path: "/", icon: <FaHome /> },
        {
          label: getText("Perfil", "profile"),
          path: `/user-viewer/${user?.id}`,
          icon: <FaUser />,
        },
        {
          label: getText("Editar Perfil", "editProfile"),
          path: `/user-viewer/${user?.id}?edit=true`,
          icon: <FaEdit />,
        },
        ...(canPublishOffersFromSidebar
          ? [
              {
                label: getText("Mis Ofertas", "myOffers"),
                path: `/user-viewer/${user?.id}?tab=myOffers`,
                icon: <FaBriefcase />,
              },
              {
                label: getText("Crear Oferta", "createOffer"),
                path: `/user-viewer/${user?.id}?tab=createOffer`,
                icon: <FaPlus />,
              },
            ]
          : []),
        {
          label: getText("Buscador", "search"),
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
          label: getText("Entrenamiento", "training"),
          path: "/cursos",
          icon: <FaDumbbell />,
        },
      ],
      subscription: {
        label: getText("Administrar Suscripción", "manageSubscription"),
        onClick: () => window.open("https://billing.stripe.com/p/login/28E00j1FVcrleEBayigbm00", "_blank"),
        icon: <FaRegCreditCard />,
      },
      bottom: [
        {
          label: getText("Configuración", "settings"),
          path: `/forgotPassword?email=${encodeURIComponent(
            user?.email || ""
          )}`,
          icon: <FaCog />,
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
          label: getText("Editar", "edit"),
          path: `/user-viewer/${user?.id}?edit=true`,
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
          path: `/user-viewer/${user?.id}`,
          icon: <FaUser />,
        },
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
      if (level === "PROFESSIONAL") return "border-verde-oscuro";
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownMobileRef.current &&
        !profileDropdownMobileRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (): string => {
    const first = user?.name?.charAt(0) ?? "";
    const last = user?.lastname?.charAt(0) ?? "";
    const initials = `${first}${last}`.toUpperCase();
    return initials || "U";
  };

  const getEditProfilePath = (): string => {
    if (role === "PLAYER" && user?.id) {
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

  const handleProfileLogoutMobile = () => {
    setIsProfileDropdownMobileOpen(false);
    logOut();
    router.push("/");
  };

  const getRoleTagLabel = (): string => {
    const puesto = (user as unknown as { puesto?: string })?.puesto;
    if (puesto && puesto.trim().length > 0) return puesto;
    if (role === "ADMIN") return getText("Admin", "admin");
    if (role === "RECRUITER") return getText("Reclutador", "recruiter");
    if (role === "CLUB") return getText("Club", "club");
    if (role === "AGENCY") return getText("Agente", "agent");
    if (role === "PLAYER") return getText("Jugador", "player");
    return getText("Usuario", "user");
  };

  const getRoleTagClasses = (): string => {
    // Cliente confirmó: TODOS los PLAYER (cualquier puesto) son tratados como
    // Futbolista. Color azul. Otros roles (AGENCY/RECRUITER/CLUB) van en verde.
    const isFutbolista = role === "PLAYER";
    if (isFutbolista) return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="flex flex-col min-h-screen bf-green-900">
      {/* Top Navbar - Solo desktop */}
      <div className="hidden md:block">{isLogged && <NewNavbar />}</div>

      {/* Mobile Top Bar */}
      {isLogged ? (
        <div className="md:hidden bg-green-700 text-white p-4 flex items-center justify-between sticky top-0 z-[110]">
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
            {isLogged && (
              <div className="relative" ref={profileDropdownMobileRef}>
                <button
                  type="button"
                  onClick={() =>
                    setIsProfileDropdownMobileOpen(!isProfileDropdownMobileOpen)
                  }
                  aria-expanded={isProfileDropdownMobileOpen}
                  aria-label={getText("Menú de perfil", "profileMenu")}
                  className={`flex items-center gap-1.5 rounded-full px-2 py-1 hover:bg-white/10 transition-colors ${isProfileDropdownMobileOpen ? "bg-white/10" : ""}`}
                >
                  {user?.imgUrl ? (
                    <Image
                      src={user.imgUrl}
                      alt={`${user?.name ?? ""} ${user?.lastname ?? ""}`.trim() || "Usuario"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div translate="no" className="notranslate w-8 h-8 rounded-full bg-verde-oscuro text-white flex items-center justify-center font-semibold text-xs uppercase ring-1 ring-white/30">
                      {getInitials()}
                    </div>
                  )}
                  <FaChevronDown
                    className={`text-white transition-transform ${isProfileDropdownMobileOpen ? "rotate-180" : ""}`}
                    size={10}
                  />
                </button>
                <AnimatePresence>
                  {isProfileDropdownMobileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 py-2 w-52 z-[220]"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownMobileOpen(false);
                          router.push(getEditProfilePath());
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 mx-1 rounded-md text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                      >
                        <FaUserEdit className="text-gray-500" />
                        <span>{getText("Editar Perfil", "profileMenuEdit")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownMobileOpen(false);
                          router.push(getSettingsPath());
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 mx-1 rounded-md text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                      >
                        <FaCog className="text-gray-500" />
                        <span>{getText("Configuración", "profileMenuSettings")}</span>
                      </button>
                      <div className="border-t border-gray-100 mx-2 my-1" />
                      <button
                        type="button"
                        onClick={handleProfileLogoutMobile}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 mx-1 rounded-md text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <FaSignOutAlt className="text-red-500" />
                        <span>{getText("Cerrar Sesión", "profileMenuLogout")}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Navbar />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        {isLogged && (
          <aside className="hidden md:flex group fixed top-0 left-0 h-dvh z-40 transition-all duration-300 ease-in-out w-[72px] hover:w-[240px] bg-white border-r border-gray-200 px-4 py-8 pt-24 shadow-md flex-col overflow-y-auto overflow-x-hidden">
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
                  className={`mt-1 px-2 py-1 text-xs rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 ${getRoleTagClasses()}`}
                >
                  {getRoleTagLabel()}
                </span>
              </div>

              <nav>
                <ul className="space-y-2">
                  {sidebarItems.main.map((item, index) => {
                    if (item.children && item.children.length > 0) {
                      const expanded = isSectionExpanded(item.label);
                      return (
                        <li key={`main-${item.label}-${index}`}>
                          <button
                            type="button"
                            onClick={() => toggleSection(item.label)}
                            className="flex items-center gap-4 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-1">
                              {item.label}
                            </span>
                            <span
                              className={`opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs ${
                                expanded ? "rotate-180" : ""
                              }`}
                            >
                              ▾
                            </span>
                          </button>
                          {expanded && (
                            <ul className="mt-1 ml-3 pl-3 border-l border-gray-200 space-y-1">
                              {item.children.map((child, ci) => (
                                <li key={`main-${item.label}-child-${ci}`}>
                                  <Link
                                    href={child.path || "/"}
                                    className="flex items-center gap-3 px-2 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-100"
                                  >
                                    <span className="text-sm">{child.icon}</span>
                                    <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                      {child.label}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    }
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
              {/* Botón de Suscripción - Mismo estilo que los demás */}
              {sidebarItems.subscription && (
                <button
                  type="button"
                  onClick={sidebarItems.subscription.onClick}
                  className="flex items-center gap-4 px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <span className="text-lg">{sidebarItems.subscription.icon}</span>
                  <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {sidebarItems.subscription.label}
                  </span>
                </button>
              )}
              
              {sidebarItems.bottom.map((item, index) => {
                if (item.onClick) {
                  return (
                    <button
                      key={`bottom-${item.label}-${index}`}
                      type="button"
                      onClick={item.onClick}
                      className="flex items-center gap-4 px-3 py-2 rounded-lg text-sm font-medium transition-all text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {item.label}
                      </span>
                    </button>
                  );
                }
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
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[150]"
            onClick={closeSidebar}
          ></button>
        )}

        {/* Mobile Sidebar */}
        {isLogged && (
          <aside
            className={`md:hidden fixed top-0 left-0 h-dvh w-80 bg-green-800 text-white transform transition-transform duration-300 ease-in-out z-[200] overflow-y-auto ${
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
                    className={`px-2 py-1 text-xs rounded-full ${getRoleTagClasses()}`}
                  >
                    {getRoleTagLabel()}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile menu items */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {sidebarItems.main.map((item, index) => {
                  if (item.children && item.children.length > 0) {
                    const expanded = isSectionExpanded(item.label);
                    return (
                      <li key={`main-${item.label}-${index}`}>
                        <button
                          type="button"
                          onClick={() => toggleSection(item.label)}
                          className="flex items-center gap-4 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-green-700 w-full text-left"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="whitespace-nowrap flex-1">
                            {item.label}
                          </span>
                          <span
                            className={`text-xs transition-transform ${
                              expanded ? "rotate-180" : ""
                            }`}
                          >
                            ▾
                          </span>
                        </button>
                        {expanded && (
                          <ul className="mt-1 ml-3 pl-3 border-l border-green-600 space-y-1">
                            {item.children.map((child, ci) => (
                              <li key={`main-${item.label}-mchild-${ci}`}>
                                <Link
                                  href={child.path || "/"}
                                  onClick={closeSidebar}
                                  className="flex items-center gap-3 px-2 py-1.5 rounded-lg text-xs text-white/90 hover:bg-green-700"
                                >
                                  <span className="text-sm">{child.icon}</span>
                                  <span className="whitespace-nowrap">
                                    {child.label}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  }
                  if (item.onClick) {
                    return (
                      <li key={`main-${item.label}-${index}`}>
                        <button
                          type="button"
                          onClick={() => {
                            item.onClick?.();
                            closeSidebar();
                          }}
                          className="flex items-center gap-4 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-green-700 w-full text-left"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="whitespace-nowrap">
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
                        className="flex items-center gap-4 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-green-700"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="whitespace-nowrap">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 pt-4 border-t border-green-600">
                <ul className="space-y-1">
                  {/* Botón de Suscripción en Mobile - Mismo estilo */}
                  {sidebarItems.subscription && (
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          sidebarItems.subscription?.onClick?.();
                          closeSidebar();
                        }}
                        className="flex items-center gap-4 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-green-700 w-full text-left"
                      >
                        <span className="text-lg">{sidebarItems.subscription.icon}</span>
                        <span>{sidebarItems.subscription.label}</span>
                      </button>
                    </li>
                  )}
                  
                  {sidebarItems.bottom.map((item, index) => {
                    if (item.onClick) {
                      return (
                        <li key={`bottom-mobile-${item.label}-${index}`}>
                          <button
                            type="button"
                            onClick={() => {
                              item.onClick?.();
                              closeSidebar();
                            }}
                            className="flex items-center gap-4 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-green-700 w-full text-left"
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                          </button>
                        </li>
                      );
                    }
                    return (
                      <li key={item.path || `bottom-mobile-${index}`}>
                        <Link
                          href={item.path || "/"}
                          onClick={closeSidebar}
                          className="flex items-center gap-4 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-green-700"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-green-600">
                <button
                  onClick={() => {
                    handleLogout();
                    closeSidebar();
                  }}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-600 transition-all w-full"
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
