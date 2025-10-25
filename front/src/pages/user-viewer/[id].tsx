import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaCog,
  FaEllipsisH,
  FaGlobe,
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaShieldAlt,
  FaSignOutAlt,
  FaUserSlash,
} from "react-icons/fa";
import { renderCountryFlag } from "@/components/countryFlag/countryFlag";
import ProfileUser from "@/components/ProfileUser/ProfileUser";
import PhoneNumberInput from "@/components/utils/PhoneNumberInput";
import { getDefaultPlayerImage } from "@/helpers/imageUtils";
import {
  formatearFecha,
  getUltimoClub,
  sortTrayectoriasByFechaDesc,
} from "@/helpers/sortAndFormatTrayectorias";
import { useUserContext } from "@/hook/useUserContext";
import { type IProfileData, UserType } from "@/Interfaces/IUser";
import {
  requestVerification,
  showVerificationToast,
} from "@/services/VerificationService";
import VerificationSubscription from "../verification-subscription";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";
import { FaBriefcase } from "react-icons/fa6";
import { FaUsers } from "react-icons/fa6";

// URL del backend
const API_URL = "https://futbolink.onrender.com";

// Función para convertir el rol a un texto más amigable
const getRoleDisplay = (role: string) => {
  const roleMap: { [key: string]: string } = {
    PLAYER: "Jugador",
    COACH: "Entrenador",
    RECRUITER: "Reclutador",
    ADMIN: "Administrador",
  };
  return roleMap[role] || role;
};

// Función para formatear URLs de YouTube para embebido
const formatYoutubeUrl = (url: string): string => {
  if (!url) return "";

  // Patrones comunes de URLs de YouTube
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i, // youtube.com/watch?v=ID
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i, // youtu.be/ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i, // youtube.com/embed/ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  // Si no coincide con ningún patrón pero contiene 'youtube', intentar usar como está
  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  // Devolver la URL original si no se pudo procesar
  console.log("No se pudo procesar la URL de YouTube:", url);
  return url;
};

export default function UserViewer() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token, role } = useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tCommon = useNextIntlTranslations("common");

  // Función para obtener el texto traducido o el texto original
  const getText = (originalText: string, translatedKey: string) => {
    return isNextIntlEnabled ? tCommon.t(translatedKey) : originalText;
  };

  const [profile, setProfile] = useState<IProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationSent, setNotificationSent] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "info" | "stats" | "career" | "portfolio"
  >("info");
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [
    showVerificationSubscriptionModal,
    setShowVerificationSubscriptionModal,
  ] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationAttachment, setVerificationAttachment] =
    useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [loadingVerification, setLoadingVerification] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    isVerified: boolean;
    columnExists: boolean;
    verificationLevel?:
      | "NONE"
      | "SEMIPROFESSIONAL"
      | "PROFESSIONAL"
      | "AMATEUR";
  } | null>(null);

  // Manager interface states
  const [portfolioPlayers, setPortfolioPlayers] = useState<any[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    hasActiveSubscription: boolean;
    subscriptionType: string;
  }>({
    hasActiveSubscription: false,
    subscriptionType: "Gratuito",
  });

  // Nivel del perfil (deportivo) considerando verificación y competitionLevel
  const computeProfileLevel = ():
    | "Profesional"
    | "Semiprofesional"
    | "Amateur" => {
    // Si el perfil no está verificado, siempre mostrar como Amateur
    if (!verificationStatus?.isVerified) {
      return "Amateur";
    }

    // Si está verificado, usar el competitionLevel del usuario
    try {
      const competitionLevel =
        profile?.competitionLevel?.toLowerCase() || "amateur";

      if (
        competitionLevel.includes("professional") ||
        competitionLevel.includes("profesional")
      ) {
        return "Profesional";
      }
      if (
        competitionLevel.includes("semiprofessional") ||
        competitionLevel.includes("semiprofesional")
      ) {
        return "Semiprofesional";
      }
      // Fallback para amateur o cualquier otro valor
      return "Amateur";
    } catch {
      return "Amateur";
    }
  };
  // Recalcular el nivel del perfil cuando cambie el estado de verificación
  const [profileLevel, setProfileLevel] = useState<
    "Profesional" | "Semiprofesional" | "Amateur"
  >("Amateur");

  useEffect(() => {
    setProfileLevel(computeProfileLevel());
  }, [verificationStatus, profile?.competitionLevel]);

  // Load portfolio and subscription info for recruiters
  useEffect(() => {
    if (profile?.role === UserType.RECRUITER) {
      loadPortfolio();
      loadSubscriptionInfo();
    }
  }, [profile?.id, profile?.role, profile?.email, token]);

  // Determina si es un jugador "puro": rol PLAYER y puesto vacío o igual a "Jugador"
  const isPurePlayer =
    profile?.role === UserType.PLAYER &&
    (!profile?.puesto || profile?.puesto.toLowerCase() === "jugador");

  // Referencias para los menús desplegables
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const verificationModalRef = useRef<HTMLDivElement>(null);

  // Función para cerrar sesión
  const handleLogout = () => {
    // Limpiar el token del localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirigir al usuario a la página de inicio
    router.push("/");

    // Opcional: recargar la página para asegurar que todos los estados se reseteen
    window.location.reload();
  };

  // Función para cargar la Portafolio de jugadores
  const loadPortfolio = async () => {
    if (!profile?.id || !token) return;

    setLoadingPortfolio(true);
    try {
      const response = await fetch(`${API_URL}/user/${profile.id}/portfolio`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPortfolioPlayers(data || []);
      }
    } catch (error) {
      console.error("Error al cargar la Portafolio de jugadores:", error);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  // Función para cargar información de suscripción
  const loadSubscriptionInfo = async () => {
    if (!profile?.email) return;

    try {
      const response = await fetch(
        `${API_URL}/user/subscription/check?email=${encodeURIComponent(
          profile.email
        )}`
      );

      if (response.ok) {
        const subscriptionData = await response.json();
        const subscriptionType = subscriptionData.subscriptionType || "Amateur";
        let displayType = subscriptionType;
        if (subscriptionType === "Amateur") {
          displayType = "Gratuito";
        } else if (subscriptionType === "Profesional") {
          displayType = "Profesional";
        }

        setSubscriptionInfo({
          hasActiveSubscription: subscriptionData.isActive === true,
          subscriptionType: displayType,
        });
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  // Función para obtener el estado de verificación de forma segura
  const fetchVerificationStatus = async (userId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/user/${userId}/verification-status`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.ok) {
        const status = await response.json();
        setVerificationStatus(status);
        console.log("Estado de verificación:", status);
        // Log para mostrar la estructura completa del objeto de verificación
        console.log(
          "Estructura completa del objeto de verificación:",
          JSON.stringify(status, null, 2)
        );
      } else {
        console.log("No se pudo obtener el estado de verificación");
        setVerificationStatus({ isVerified: false, columnExists: false });
      }
    } catch (error) {
      console.error("Error al obtener estado de verificación:", error);
      setVerificationStatus({ isVerified: false, columnExists: false });
    }
  };

  // Función para manejar la subida de archivos
  const handleFileUpload = async (file: File): Promise<string> => {
    setUploadingAttachment(true);
    try {
      // For now, we'll just return the file name as a placeholder
      // In a production environment, you would implement actual file upload
      // to a cloud storage service like AWS S3, Cloudinary, etc.

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Return a placeholder URL with the file name
      return `placeholder://${file.name}`;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    } finally {
      setUploadingAttachment(false);
    }
  };

  // Función para solicitar verificación
  const handleRequestVerification = async () => {
    if (!profile?.id || !token) {
      toast.error("Debes iniciar sesión para solicitar verificación");
      return;
    }

    setLoadingVerification(true);
    const toastId = showVerificationToast.loading(
      "Enviando solicitud de verificación..."
    );

    try {
      let attachmentUrl: string | undefined;

      // Upload file if provided
      if (verificationAttachment) {
        try {
          attachmentUrl = await handleFileUpload(verificationAttachment);
        } catch (uploadError) {
          showVerificationToast.error(
            "Error al subir el archivo. Inténtalo de nuevo."
          );
          return;
        }
      }

      await requestVerification(
        profile.id,
        {
          message: verificationMessage,
          attachmentUrl,
        },
        token
      );

      showVerificationToast.success(
        "¡Solicitud de verificación enviada exitosamente! Los administradores la revisarán pronto."
      );
      setVerificationMessage("");
      setVerificationAttachment(null);
      setShowVerificationModal(false);
    } catch (error: unknown) {
      let errorMessage = "Error al enviar la solicitud de verificación";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      showVerificationToast.error(errorMessage);
    } finally {
      setLoadingVerification(false);
      if (toastId) {
        toast.dismiss(toastId);
      }
    }
  };

  // Función para manejar el clic en el botón de verificación
  const handleVerificationClick = () => {
    // Si el usuario ya está verificado, mostrar modal para cargar documentación adicional
    if (verificationStatus?.isVerified) {
      setShowVerificationModal(true);
    } else {
      // Si no está verificado, mostrar modal de suscripción
      setShowVerificationSubscriptionModal(true);
    }
  };

  // Efecto para cerrar los menús al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Cerrar menú de compartir
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setShowShareOptions(false);
      }

      // Cerrar menú de opciones
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setShowMoreOptions(false);
      }

      // Cerrar modal de verificación
      if (
        verificationModalRef.current &&
        !verificationModalRef.current.contains(event.target as Node)
      ) {
        setShowVerificationModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Función para enviar notificación de visualización de perfil
  const sendProfileViewNotification = async (viewedUserId: string) => {
    try {
      // Solo enviar la notificación si el usuario está autenticado y es un ofertante
      if (!token || !user || !["RECRUITER", "ADMIN"].includes(role || "")) {
        console.log(
          "No se envía notificación: usuario no autenticado o no es ofertante"
        );
        return;
      }

      // No enviar notificación si el usuario está viendo su propio perfil
      if (user.id === viewedUserId) {
        console.log(
          "No se envía notificación: usuario viendo su propio perfil"
        );
        return;
      }

      // Enviar la notificación al backend
      const response = await fetch(`${API_URL}/notifications/profile-view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ viewedUserId }),
      });

      if (response.ok) {
        console.log(
          "Notificación de visualización de perfil enviada correctamente"
        );
        setNotificationSent(true);
      } else {
        console.error(
          "Error al enviar la notificación:",
          await response.text()
        );
      }
    } catch (err) {
      console.error("Error al enviar la notificación:", err);
    }
  };

  useEffect(() => {
    // Verificar si el ID de la URL coincide con el ID del usuario logueado
    if (id && user && user.id) {
      const isSameUser = id === user.id;
      setIsOwnProfile(isSameUser);
      console.log(`¿Es el propio perfil del usuario? ${isSameUser}`);
    }

    // Solo cargar datos cuando tengamos un ID válido
    if (!id || typeof id !== "string") {
      return;
    }

    console.log("Cargando perfil de usuario con ID:", id);

    // Función para cargar el perfil directamente desde el backend
    const fetchUserProfile = async () => {
      try {
        // Crear URL al backend
        const url = `${API_URL}/user/${id}`;
        console.log("Realizando solicitud a:", url);

        // Realizar la solicitud sin headers problemáticos
        const response = await fetch(url);

        console.log("Respuesta recibida:", response.status);

        if (!response.ok) {
          throw new Error(`Error al cargar el perfil: ${response.status}`);
        }

        // Convertir a JSON
        const data = await response.json();
        console.log("Datos recibidos:", data);
        console.log(
          "Estructura completa del objeto de perfil:",
          JSON.stringify(data, null, 2)
        );

        // Determinar el nivel de competencia correcto
        // Primero verificar competitionLevel, luego usar amateur como fallback
        if (!data.competitionLevel) {
          console.log(
            "No se encontró competitionLevel, usando amateur como predeterminado"
          );
          data.competitionLevel = "amateur";
        } else {
          console.log(
            "Usando competitionLevel existente:",
            data.competitionLevel
          );
        }

        // Asignar el rol del usuario al campo puesto para mostrar en CardProfile
        if (!data.puesto || data.puesto.trim() === "") {
          if (data.role) {
            data.puesto = getRoleDisplay(data.role);
          } else if (data.posicion) {
            // Si tiene una posición específica (para jugadores), usar esa
            data.puesto = data.posicion;
          }
        }

        // Actualizar estado
        setProfile(data);
        setLoading(false);

        // Enviar notificación de visualización de perfil
        if (!notificationSent) {
          sendProfileViewNotification(id);
        }

        // Obtener estado de verificación de forma segura
        fetchVerificationStatus(id);
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, token, notificationSent, user, role]);

  // Mostrar carga
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center min-h-screen pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando perfil de usuario...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 text-center mt-20">
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
          <Link
            href="/jobs"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Volver a ofertas
          </Link>
        </div>
      </div>
    );
  }

  // Mostrar "no encontrado" si no hay perfil
  if (!profile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 text-center mt-20">
          <div className="bg-blue-100 border border--300 text-blue-700 px-4 py-3 rounded mb-4">
            <p>No se encontró el perfil solicitado</p>
          </div>
          <Link
            href="/jobs"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Volver a ofertas
          </Link>
        </div>
      </div>
    );
  }

  // Si es el propio perfil del usuario, mostrar el componente de edición
  if (isOwnProfile && router.query.edit === "true") {
    return (
      <div className="min-h-screen bg-white">
        <Head>
          <title>Editar Mi Perfil - FutboLink</title>
          <meta name="description" content="Gestiona tu perfil en FutboLink" />
        </Head>
        <div className="container mx-auto px-4 mt-5">
          <div className="relative flex items-center justify-center py-2">
            {/* Botón alineado a la izquierda */}
            <div className="absolute left-0 top-1">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <FaArrowLeft className="mr-2" /> Volver a mi perfil
              </button>
            </div>

            {/* Título centrado con margen superior */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mt-8 text-center">
              Editar Mi Perfil
            </h1>
          </div>

          <ProfileUser />
        </div>
      </div>
    );
  }

  // Determinar la última trayectoria (club actual)
  const currentClub = getUltimoClub(profile?.trayectorias);

  // Obtener la fecha de finalización del contrato
  const contractEndDate = currentClub?.fechaFinalizacion
    ? new Date(currentClub.fechaFinalizacion).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "No especificada";

  // Renderizar el perfil
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Head>
        <title>
          {isOwnProfile ? "Mi Perfil" : `${profile.name} ${profile.lastname}`} -
          FutboLink
        </title>
        <meta
          name="description"
          content={`Perfil de ${profile.name} ${profile.lastname} - ${
            profile.puesto || ""
          }`}
        />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      {/* Powered by logo - sticky debajo de navbar */}
      <div className="sticky top-0 left-0 right-0 bg-white shadow-sm py-1 z-20">
        <div className="flex justify-center items-center px-4">
          <span className="text-xs text-gray-400 mr-2">Powered by</span>
          <Link href="/">
            <Image
              src="/logo nombre completo.png"
              alt="FutboLink"
              width={90}
              height={30}
              className="h-8 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>
      </div>

      {/* Contenido principal - Ajustado para tener en cuenta la navbar y el powered by */}
      <div className="pt-1 mt-4 container mx-auto px-4 md:px-8 lg:px-12 xl:px-24">
        {/* Botón de edición (solo visible si es el propio perfil) */}

        {/* Conditional rendering: Manager interface for recruiters */}
        {profile?.role === UserType.RECRUITER ? (
          <div className="lg:flex lg:gap-8">
            {/* Columna izquierda - Card de perfil del manager */}
            <div className="lg:w-1/3">
              <div className="pt-8 pb-4 px-4 bg-white rounded-lg shadow-sm mb-4">
                <div className="flex items-center mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500">
                    <Image
                      src={profile?.imgUrl || "/default-avatar.png"}
                      alt={profile?.name || "Foto de perfil"}
                      width={80}
                      height={80}
                      className="object-cover shadow-lg w-full h-full"
                    />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-medium text-gray-600">
                      {profile?.name}
                    </h2>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {profile?.lastname}
                    </h1>
                    <p className="text-sm text-purple-600 font-medium">
                      Agencia/Reclutador
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                  <span>{profile?.nameAgency || "Manager"}</span>
                  {profile?.ubicacionActual && (
                    <>
                      <span className="mx-2">|</span>
                      <span>{profile.ubicacionActual}</span>
                    </>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <button
                    className="flex flex-col items-center justify-center p-2 transition-colors duration-200 hover:bg-gray-50 rounded-lg"
                    onClick={() => setLiked(!liked)}
                    type="button"
                  >
                    {liked ? (
                      <FaHeart className="text-red-500 text-lg" />
                    ) : (
                      <FaRegHeart className="text-gray-500 text-lg" />
                    )}
                    <span
                      className={`text-xs ${
                        liked ? "text-red-500" : "text-gray-500"
                      } mt-1 font-medium`}
                    >
                      Me gusta
                    </span>
                  </button>

                  <button
                    className="flex flex-col items-center justify-center p-2 transition-colors duration-200 hover:bg-gray-50 rounded-lg"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setUrlCopied(true);
                      setTimeout(() => setUrlCopied(false), 2000);
                    }}
                    type="button"
                  >
                    {urlCopied ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs text-green-500 mt-1 font-medium">
                          ¡Copiado!
                        </span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <span className="text-xs text-gray-500 mt-1 font-medium">
                          Copiar URL
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    className="flex flex-col items-center justify-center p-2 transition-colors duration-200 hover:bg-gray-50 rounded-lg"
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    type="button"
                  >
                    <FaShareAlt className="text-gray-500 text-lg" />
                    <span className="text-xs text-gray-500 mt-1 font-medium">
                      Compartir
                    </span>
                  </button>

                  <div className="relative group" ref={moreMenuRef}>
                    <button
                      className="flex flex-col items-center justify-center p-2 transition-colors duration-200 hover:bg-gray-50 rounded-lg"
                      onClick={() => setShowMoreOptions(!showMoreOptions)}
                      type="button"
                    >
                      <FaEllipsisH className="text-gray-500 text-lg" />
                      <span className="text-xs text-gray-500 mt-1 font-medium">
                        Opciones
                      </span>
                    </button>

                    {/* Menú desplegable de opciones */}
                    {showMoreOptions && (
                      <div className="absolute right-0 bottom-16 bg-white rounded-lg shadow-lg p-2 z-50 border border-gray-200 w-48">
                        <div className="flex flex-col gap-1">
                          <button
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-left w-full"
                            onClick={() => {
                              alert("Función de reporte no implementada");
                            }}
                            type="button"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-red-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm">Reportar perfil</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Menú desplegable de compartir */}
                {showShareOptions && (
                  <div
                    ref={shareMenuRef}
                    className="absolute right-20 bottom-16 bg-white rounded-lg shadow-lg p-2 z-10 border border-gray-200"
                  >
                    <div className="flex flex-col gap-2">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `¡Mira este perfil en FutboLink! ${window.location.href}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                      >
                        <svg
                          className="w-5 h-5 text-green-600"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                          aria-hidden="true"
                        >
                          <path
                            fill="currentColor"
                            d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
                          />
                        </svg>
                        <span className="text-sm">WhatsApp</span>
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          `¡Mira este perfil en FutboLink!`
                        )}&url=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                      >
                        <svg
                          className="w-5 h-5 text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          aria-hidden="true"
                        >
                          <path
                            fill="currentColor"
                            d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
                          />
                        </svg>
                        <span className="text-sm">X (Twitter)</span>
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          window.location.href
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                      >
                        <svg
                          className="w-5 h-5 text-blue-700"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 320 512"
                          aria-hidden="true"
                        >
                          <path
                            fill="currentColor"
                            d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"
                          />
                        </svg>
                        <span className="text-sm">Facebook</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Suscripción */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 shadow-md border border-green-200 mb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Plan de Suscripción
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    subscriptionInfo.subscriptionType === "Profesional"
                      ? "bg-green-600 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {subscriptionInfo.subscriptionType}
                </span>
                {subscriptionInfo.subscriptionType === "Gratuito" && (
                  <div className="mt-2">
                    <Link
                      href="/manager-subscription"
                      className="text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      Actualizar a Plan Profesional
                    </Link>
                  </div>
                )}
              </div>

              {/* Jugadores Representados */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-t-lg flex items-center gap-2">
                  <FaBriefcase
                    size={20}
                    className="text-white"
                    aria-label="Maletín"
                  />
                  <h3 className="text-base font-bold text-white">Portafolio</h3>
                </div>
                <div className="p-3">
                  {loadingPortfolio ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : portfolioPlayers.length > 0 ? (
                    <div className="space-y-2">
                      {portfolioPlayers.slice(0, 5).map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-200 flex-shrink-0">
                            <Image
                              src={player.imgUrl || "/default-player.png"}
                              alt={`${player.name} ${player.lastname}`}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-800 truncate">
                              {player.name} {player.lastname}
                            </p>
                            <p className="text-xs text-gray-500">
                              {player.primaryPosition || "N/D"}
                              {player.age ? ` • ${player.age} años` : ""}
                            </p>
                          </div>
                          <Link
                            href={`/user-viewer/${player.id}`}
                            className="px-3 py-1 bg-purple-600 text-white rounded-md text-xs hover:bg-purple-700 transition-colors flex-shrink-0"
                          >
                            Ver perfil
                          </Link>
                        </div>
                      ))}
                      {portfolioPlayers.length > 5 && (
                        <div className="pt-2 text-center">
                          <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">
                            Ver todos ({portfolioPlayers.length})
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FaUsers className="mx-auto text-3xl text-gray-300 mb-2" />
                      <p className="text-xs text-gray-500">
                        Sin jugadores representados
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Columna derecha - Tabs y contenido del manager */}
            <div className="lg:w-2/3">
              {/* Pestañas de navegación para reclutadores */}
              <div className="px-4 mb-4">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("info")}
                    type="button"
                    className={`flex-1 py-3 text-center ${
                      activeTab === "info"
                        ? "text-green-600 border-b-2 border-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    Información
                  </button>
                  <button
                    onClick={() => setActiveTab("stats")}
                    type="button"
                    className={`flex-1 py-3 text-center ${
                      activeTab === "stats"
                        ? "text-green-600 border-b-2 border-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    Estadísticas
                  </button>
                  <button
                    onClick={() => setActiveTab("portfolio")}
                    type="button"
                    className={`flex-1 py-3 text-center ${
                      activeTab === "portfolio"
                        ? "text-green-600 border-b-2 border-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    Portafolio
                  </button>
                </div>
              </div>

              {/* Contenido de las pestañas */}
              <div className="px-4 pb-20 lg:pb-8">
                {activeTab === "info" && (
                  <div className="space-y-4">
                    {/* Información de la agencia */}
                    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                      <h3 className="text-lg font-medium mb-3 text-gray-800">
                        Información de la agencia
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nombre completo</span>
                          <span className="text-gray-800">
                            {profile?.name} {profile?.lastname}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Nombre de la entidad
                          </span>
                          <span className="text-gray-800">
                            {profile?.nameAgency || "No disponible"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Tipo de organización
                          </span>
                          <span className="text-gray-800">
                            {profile?.puesto || "No especificado"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Año de fundación
                          </span>
                          <span className="text-gray-800">
                            {profile?.age || "No especificado"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nacionalidad</span>
                          <span className="flex items-center text-gray-800">
                            {profile?.nationality &&
                              renderCountryFlag(profile.nationality)}
                            <span className="ml-2">
                              {profile?.nationality || "No disponible"}
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            País de Residencia
                          </span>
                          <span className="flex items-center text-gray-800">
                            {profile?.ubicacionActual &&
                              renderCountryFlag(profile.ubicacionActual)}
                            <span className="ml-2">
                              {profile?.ubicacionActual || "No disponible"}
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Región</span>
                          <span className="text-gray-800">
                            {profile?.location || "No especificada"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Información de contacto restringida */}
                    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                      <h3 className="text-lg font-medium mb-3 text-gray-800">
                        Información de contacto
                      </h3>
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-blue-600 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m0-6v4m0-8v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-blue-800">
                                Información restringida
                              </p>
                              <p className="text-xs text-blue-700">
                                Los datos de contacto de agencias no están
                                disponibles con tu suscripción actual.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-400 mr-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-sm text-gray-500">
                                Email
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                              ●●●●●●●●
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-400 mr-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              <span className="text-sm text-gray-500">
                                Teléfono
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                              ●●●●●●●●
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-400 mr-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <span className="text-sm text-gray-500">
                                Ubicación
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                              ●●●●●●●●
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Video de Presentación */}
                    {profile?.videoUrl && (
                      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                        <h3 className="text-lg font-medium mb-3 text-gray-800">
                          Video de Presentación
                        </h3>
                        <div className="relative w-full bg-black rounded-lg overflow-hidden">
                          <iframe
                            src={profile.videoUrl}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-[350px]"
                            title="Video de presentación"
                          />
                        </div>
                      </div>
                    )}

                    {/* CV Section */}
                    {profile?.cv && (
                      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                        <h3 className="text-lg font-medium mb-3 text-gray-800">
                          Currículum Vitae
                        </h3>
                        <a
                          href={profile.cv}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                        >
                          Ver CV
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Pestaña de Estadísticas */}
                {activeTab === "stats" && (
                  <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                    <h3 className="text-lg font-medium mb-3 text-gray-800">
                      Estadísticas de la Agencia
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                              <FaUsers className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-gray-800">
                                {portfolioPlayers.length}
                              </p>
                              <p className="text-sm text-gray-600">
                                Jugadores Representados
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                              <FaBriefcase className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-gray-800">
                                {subscriptionInfo.subscriptionType}
                              </p>
                              <p className="text-sm text-gray-600">
                                Plan de Suscripción
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-blue-600 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              Estadísticas adicionales
                            </p>
                            <p className="text-xs text-blue-700">
                              Más métricas disponibles con suscripción
                              profesional
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pestaña de Portafolio */}
                {activeTab === "portfolio" && (
                  <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                    <h3 className="text-lg font-medium mb-3 text-gray-800">
                      Portafolio de Jugadores
                    </h3>
                    {loadingPortfolio ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                      </div>
                    ) : portfolioPlayers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {portfolioPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="bg-gray-50 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              {/* Foto de perfil */}
                              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200">
                                <Image
                                  src={player.imgUrl || "/default-player.png"}
                                  alt={`${player.name} ${player.lastname}`}
                                  width={56}
                                  height={56}
                                  className="object-cover w-full h-full"
                                />
                              </div>

                              {/* Información básica */}
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-800">
                                  {player.name} {player.lastname}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {player.primaryPosition || "Sin posición"}
                                  {player.age ? ` • ${player.age} años` : ""}
                                </p>
                              </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex justify-between mt-3">
                              <Link
                                href={`/user-viewer/${player.id}`}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                              >
                                Ver perfil
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <div className="text-gray-500 mb-4">
                          <FaUsers className="mx-auto text-6xl mb-4 text-gray-400" />
                          <h4 className="text-lg font-semibold text-gray-600">
                            Sin jugadores en el portafolio
                          </h4>
                          <p className="mt-2 text-gray-500">
                            Esta agencia aún no tiene jugadores representados
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Original layout for non-recruiters */
          <div className="lg:flex lg:gap-8">
            {/* Columna izquierda - Información del perfil */}
            <div className="lg:w-1/3">
              {/* Header con información del usuario */}
              <div className="pt-8 pb-4 px-4 from-gray-100 bg-white rounded-lg shadow-sm mb-4">
                <div className="flex items-center mb-2">
                  <div className="relative">
                    <div
                      className={`w-20 h-20 rounded-full overflow-hidden border-2  ${(() => {
                        const isPlayer =
                          (profile.role as UserType) !== UserType.RECRUITER;
                        const level = verificationStatus?.verificationLevel;
                        if (verificationStatus?.isVerified && isPlayer) {
                          if (level === "PROFESSIONAL")
                            return "border-gray-500";
                          if (level === "SEMIPROFESSIONAL")
                            return "border-gray-400";
                          return "border-gray-500";
                        }
                        return "border-gray-500";
                      })()}`}
                    >
                      <Image
                        src={
                          profile.imgUrl || getDefaultPlayerImage(profile.genre)
                        }
                        alt={`${profile.name} ${profile.lastname}`}
                        width={64}
                        height={64}
                        className="object-cover shadow-lg w-full h-full"
                      />
                    </div>
                    {(profile.role as UserType) === UserType.RECRUITER && (
                      <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                    )}
                    {/* (Insignia movida al lado del nombre) */}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      {profile.nationality && (
                        <span className="mr-2">
                          {renderCountryFlag(profile.nationality)}
                        </span>
                      )}
                      <h2 className="text-xl font-medium text-gray-600 flex items-center gap-1">
                        {profile.name}
                        {verificationStatus?.isVerified &&
                          (profile.role as UserType) !== UserType.RECRUITER && (
                            <span className="inline-flex items-center">
                              <svg
                                className="w-5 h-5 text-blue-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                      </h2>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {profile.lastname}
                    </h1>
                    {(profile.role as UserType) === UserType.RECRUITER && (
                      <p className="text-sm text-purple-600 font-medium">
                        Agencia/Reclutador
                      </p>
                    )}
                    {!isPurePlayer &&
                      (profile.role as UserType) !== UserType.RECRUITER &&
                      profile.puesto && (
                        <p className="text-sm text-gray-600 font-medium">
                          {profile.puesto}
                        </p>
                      )}
                  </div>
                </div>

                {/* Estado, edad, nivel deportivo y verificación - Para jugadores */}
                {isPurePlayer && (
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span>{profile.primaryPosition}</span>
                    </div>
                    <span className="mx-2">|</span>
                    <span>{profile.age} años</span>
                    {/* Nivel del perfil (deportivo) - dependiente de verificación */}
                    <span className="mx-2">|</span>
                    <span className="flex items-center">{profileLevel}</span>
                  </div>
                )}

                {/* Información básica para profesionales no jugadores */}
                {!isPurePlayer &&
                  (profile.role as UserType) !== UserType.RECRUITER && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                        <span>
                          {profile.puesto || getRoleDisplay(profile.role)}
                        </span>
                      </div>
                      <span className="mx-2">|</span>
                      <span>{profile.age} años</span>
                      {/* Nivel profesional - dependiente de verificación */}
                      <span className="mx-2">|</span>
                      <span className="flex items-center">{profileLevel}</span>
                    </div>
                  )}

                {/* Información básica para reclutadores */}
                {(profile.role as UserType) === UserType.RECRUITER && (
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                      <span>Agencia de representación</span>
                    </div>
                    {profile.ubicacionActual && (
                      <>
                        <span className="mx-2">|</span>
                        <span>{profile.ubicacionActual}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <button
                    className="flex flex-col items-center justify-center p-2 transition-colors duration-200 hover:bg-gray-50 rounded-lg"
                    onClick={() => setLiked(!liked)}
                    type="button"
                  >
                    {liked ? (
                      <FaHeart className="text-red-500 text-lg" />
                    ) : (
                      <FaRegHeart className="text-gray-500 text-lg" />
                    )}
                    <span
                      className={`text-xs ${
                        liked ? "text-red-500" : "text-gray-500"
                      } mt-1 font-medium`}
                    >
                      Me gusta
                    </span>
                  </button>

                  <button
                    className="flex flex-col items-center justify-center p-2 transition-colors duration-200 hover:bg-gray-50 rounded-lg"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setUrlCopied(true);
                      setTimeout(() => setUrlCopied(false), 2000);
                    }}
                    type="button"
                  >
                    {urlCopied ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs text-green-500 mt-1 font-medium">
                          ¡Copiado!
                        </span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <span className="text-xs text-gray-500 mt-1 font-medium">
                          Copiar URL
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    className="flex flex-col items-center justify-center p-2 transition-colors duration-200 hover:bg-gray-50 rounded-lg"
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    type="button"
                  >
                    <FaShareAlt className="text-gray-500 text-lg" />
                    <span className="text-xs text-gray-500 mt-1 font-medium">
                      Compartir
                    </span>
                  </button>

                  {/* Verification Button */}
                  {isOwnProfile && token && (
                    <button
                      className="flex flex-col items-center justify-center p-2 transition-colors duration-200 hover:bg-gray-50 rounded-lg"
                      onClick={handleVerificationClick}
                      aria-label="boton para verificar el perfil"
                      type="button"
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs text-gray-500 mt-1 font-medium">
                        {verificationStatus?.isVerified
                          ? "Documentación"
                          : "Verificar"}
                      </span>
                    </button>
                  )}

                  {/* Menú desplegable de compartir */}
                  {showShareOptions && (
                    <div
                      ref={shareMenuRef}
                      className="absolute right-20 bottom-16 bg-white rounded-lg shadow-lg p-2 z-10 border border-gray-200"
                    >
                      <div className="flex flex-col gap-2">
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `¡Mira este perfil en FutboLink! ${window.location.href}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                        >
                          <svg
                            className="w-5 h-5 text-green-600"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                            aria-hidden="true"
                          >
                            <path
                              fill="currentColor"
                              d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
                            />
                          </svg>
                          <span className="text-sm">WhatsApp</span>
                        </a>
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            `¡Mira este perfil en FutboLink!`
                          )}&url=${encodeURIComponent(window.location.href)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                        >
                          <svg
                            className="w-5 h-5 text-blue-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            aria-hidden="true"
                          >
                            <path
                              fill="currentColor"
                              d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
                            />
                          </svg>
                          <span className="text-sm">X (Twitter)</span>
                        </a>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                            window.location.href
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                        >
                          <svg
                            className="w-5 h-5 text-blue-700"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                            aria-hidden="true"
                          >
                            <path
                              fill="currentColor"
                              d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"
                            />
                          </svg>
                          <span className="text-sm">Facebook</span>
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="relative group" ref={moreMenuRef}>
                    <button
                      className="flex flex-col items-center justify-center p-2 transition-colors duration-200 hover:bg-gray-50 rounded-lg"
                      onClick={() => setShowMoreOptions(!showMoreOptions)}
                      type="button"
                    >
                      <FaEllipsisH className="text-gray-500 text-lg" />
                      <span className="text-xs text-gray-500 mt-1 font-medium">
                        Opciones
                      </span>
                    </button>

                    {/* Menú desplegable de opciones */}
                    {showMoreOptions && (
                      <div className="absolute right-0 bottom-16 bg-white rounded-lg shadow-lg p-2 z-50 border border-gray-200 w-48">
                        <div className="flex flex-col gap-1">
                          <button
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-left w-full"
                            onClick={() => {
                              // Aquí puedes implementar la lógica para reportar
                              alert("Función de reporte no implementada");
                            }}
                            type="button"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-red-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm">Reportar perfil</span>
                          </button>
                          {isOwnProfile && (
                            <button
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-left w-full"
                              onClick={() =>
                                router.push(`/user-viewer/${id}?edit=true`)
                              }
                              type="button"
                            >
                              <FaCog className="h-5 w-5 text-gray-600" />
                              <span className="text-sm">Editar perfil</span>
                            </button>
                          )}
                          {isOwnProfile && (
                            <button
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-left w-full"
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/forgotPassword?email=${encodeURIComponent(
                                    profile?.email || ""
                                  )}`
                                )
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-blue-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6h-7a6 6 0 01-6-6 6 6 0 016-6h7a6 6 0 016 6z"
                                />
                              </svg>
                              <span className="text-sm">
                                Cambiar contraseña
                              </span>
                            </button>
                          )}
                          {isOwnProfile && (
                            <button
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-left w-full"
                              onClick={handleLogout}
                              type="button"
                            >
                              <FaSignOutAlt className="h-5 w-5 text-red-600" />
                              <span className="text-sm">Cerrar sesión</span>
                            </button>
                          )}
                          {isOwnProfile && (
                            <button
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-left w-full"
                              onClick={handleVerificationClick}
                              type="button"
                              aria-label="icono de verificacion"
                            >
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-sm">
                                {verificationStatus?.isVerified
                                  ? "Subir Documentación"
                                  : "Solicitar Verificación"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Club actual - Para jugadores */}
              {currentClub && isPurePlayer && (
                <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3 border border-gray-200">
                      {/* Aquí iría el logo del club si está disponible */}
                      <FaShieldAlt className="w-7 h-7 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {currentClub.club}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        {profile.nationality && (
                          <span className="mr-1">
                            {renderCountryFlag(profile.nationality)}
                          </span>
                        )}
                        <span>
                          {currentClub.nivelCompetencia || "Primera división"}
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto"></div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <span>Hasta {contractEndDate}</span>
                  </div>
                </div>
              )}

              {/* Último club/organización - Para profesionales no jugadores */}
              {currentClub &&
                !isPurePlayer &&
                (profile.role as UserType) !== UserType.RECRUITER && (
                  <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3 border border-gray-200">
                        {/* Aquí iría el logo del club si está disponible */}
                        <FaShieldAlt className="w-7 h-7 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {currentClub.club}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          {profile.nationality && (
                            <span className="mr-1">
                              {renderCountryFlag(profile.nationality)}
                            </span>
                          )}
                          <span>
                            {currentClub.nivelCompetencia ||
                              "Organización deportiva"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>
                            Rol:{" "}
                            {profile.puesto || getRoleDisplay(profile.role)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-auto"></div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <span>Hasta {contractEndDate}</span>
                    </div>
                  </div>
                )}

              {/* Agente/Representación - Solo para jugadores */}

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 shadow-md border border-green-200 mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-3 border-2 border-green-300 shadow-sm">
                    {profile.nameAgency ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-7 w-7 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    ) : (
                      <FaUserSlash className="w-7 h-7 text-green-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Representación</h3>
                    <div className="flex items-center">
                      {profile.nameAgency ? (
                        <div className="flex items-center">
                          <span className="text-green-700 font-medium">
                            {profile.nameAgency}
                          </span>
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                            Agente oficial
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-green-600 font-medium">
                            Sin representación
                          </span>
                          <span className="ml-2 bg-red-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                            Free Agent
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas principales - Solo para jugadores */}
              {isPurePlayer && (
                <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    {/* Pie hábil */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 mb-2 relative flex items-center justify-center">
                        {profile.skillfulFoot === "Izquierdo" ? (
                          <Image
                            src="/icons-positions/pie izquierdo.png"
                            alt="Pie izquierdo"
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Image
                            src="/icons-positions/pie derecho.png"
                            alt="Pie derecho"
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {profile.skillfulFoot || "DER"}
                      </span>
                      <span className="text-xs text-gray-500">Pie</span>
                    </div>

                    {/* Posición */}
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-12 mb-2 relative flex items-center justify-center">
                        {profile.primaryPosition === "Portero" ? (
                          <Image
                            src="/icons-positions/portero.png"
                            alt="Portero"
                            width={88}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : profile.primaryPosition === "Defensor Central" ? (
                          <Image
                            src="/icons-positions/defensor central.png"
                            alt="Defensor central"
                            width={88}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : profile.primaryPosition === "Lateral Derecho" ? (
                          <Image
                            src="/icons-positions/lateral derecho.png"
                            alt="Lateral derecho"
                            width={88}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : profile.primaryPosition === "Lateral Izquierdo" ? (
                          <Image
                            src="/icons-positions/lateral izquierdo.png"
                            alt="Lateral izquierdo"
                            width={88}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : profile.primaryPosition ===
                          "Mediocampista Ofensivo" ? (
                          <Image
                            src="/icons-positions/mediocampista.png"
                            alt="Mediocampista"
                            width={88}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : profile.primaryPosition ===
                          "Mediocampista Central" ? (
                          <Image
                            src="/icons-positions/mediocampista central.png"
                            alt="Mediocampista central"
                            width={88}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : profile.primaryPosition === "Extremo Derecho" ? (
                          <Image
                            src="/icons-positions/extremo derecho.png"
                            alt="Extremo derecho"
                            width={88}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : profile.primaryPosition === "Extremo Izquierdo" ? (
                          <Image
                            src="/icons-positions/extremo izquierdo.png"
                            alt="Extremo izquierdo"
                            width={88}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : profile.primaryPosition === "Delantero Centro" ? (
                          <Image
                            src="/icons-positions/delantero centro.png"
                            alt="Delantero centro"
                            width={88}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Image
                            src="/icons-positions/portero.png"
                            alt="Posición"
                            width={88}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {profile.primaryPosition || "N/A"}
                      </span>
                      <span className="text-xs text-gray-500">Posición</span>
                    </div>

                    {/* Altura */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 mb-2 flex justify-center items-center">
                        <span className="text-2xl font-bold text-green-600">
                          {profile.height
                            ? (profile.height / 100).toFixed(2)
                            : "1.67"}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Mts
                      </span>
                      <span className="text-xs text-gray-500">Altura</span>
                    </div>

                    {/* Peso */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 mb-2 flex justify-center items-center">
                        <span className="text-2xl font-bold text-green-600">
                          {profile.weight || "70"}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Kg
                      </span>
                      <span className="text-xs text-gray-500">Peso</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sección de CV */}
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mt-4">
                <h3 className="text-lg font-medium mb-3 text-gray-800">
                  Currículum Vitae
                </h3>
                {profile.cv ? (
                  <a
                    href={profile.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Ver CV
                  </a>
                ) : (
                  <p className="text-gray-600 text-sm">No hay CV cargado.</p>
                )}
              </div>

              {/* Información de contacto para reclutadores */}
              {(profile.role as UserType) === UserType.RECRUITER && (
                <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mb-4">
                  <h3 className="text-lg font-medium mb-3 text-gray-800">
                    Información de contacto
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m0-6v4m0-8v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Información restringida
                          </p>
                          <p className="text-xs text-blue-700">
                            Los datos de contacto de agencias no están
                            disponibles con tu suscripción actual.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm text-gray-500">Email</span>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                          ●●●●●●●●
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span className="text-sm text-gray-500">
                            Teléfono
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                          ●●●●●●●●
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-sm text-gray-500">
                            Ubicación
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                          ●●●●●●●●
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón de contacto para desktop (fijo en la columna) */}
              <div className="hidden lg:block">
                {!isOwnProfile &&
                  (profile.role as UserType) === UserType.RECRUITER && (
                    <div className="w-full bg-gray-100 border border-gray-300 py-3 px-8 rounded-lg text-center">
                      <div className="flex items-center justify-center mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-400 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m0-6v4m0-8v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">
                          Contacto restringido
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        No disponible con tu suscripción actual
                      </p>
                    </div>
                  )}
                {!isOwnProfile &&
                  (profile.role as UserType) !== UserType.RECRUITER &&
                  profile.phone && (
                    <a
                      href={`https://wa.me/${profile.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-green-600 text-white py-3 px-8 rounded-lg font-medium shadow-md hover:bg-green-700 transition-colors text-center"
                    >
                      Contactar
                    </a>
                  )}
                {!isOwnProfile &&
                  (profile.role as UserType) !== UserType.RECRUITER &&
                  !profile.phone && (
                    <div className="text-center text-gray-500 text-sm">
                      Este usuario no ha proporcionado un número de teléfono
                      para contacto.
                    </div>
                  )}
              </div>
            </div>

            {/* Columna derecha - Pestañas y contenido */}
            <div className="lg:w-2/3">
              {/* Pestañas de navegación */}
              <div className="px-4 mb-4">
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("info")}
                    type="button"
                    className={`flex-1 py-3 text-center ${
                      activeTab === "info"
                        ? "text-green-600 border-b-2 border-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    Información
                  </button>
                  <button
                    onClick={() => setActiveTab("stats")}
                    type="button"
                    className={`flex-1 py-3 text-center ${
                      activeTab === "stats"
                        ? "text-green-600 border-b-2 border-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    Estadísticas
                  </button>
                  <button
                    onClick={() => setActiveTab("career")}
                    type="button"
                    className={`flex-1 py-3 text-center ${
                      activeTab === "career"
                        ? "text-green-600 border-b-2 border-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    Trayectoria
                  </button>
                </div>
              </div>

              {/* Contenido de las pestañas */}
              <div className="px-4 pb-20 lg:pb-8">
                {activeTab === "info" && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                      <h3 className="text-lg font-medium mb-3 text-gray-800">
                        {(profile.role as UserType) === UserType.RECRUITER
                          ? getText(
                              "Información de la agencia",
                              "agencyInformation"
                            )
                          : getText(
                              "Información personal",
                              "personalInformation"
                            )}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {getText("Nombre completo", "fullName")}
                          </span>
                          <span className="text-gray-800">
                            {profile.name} {profile.lastname}
                          </span>
                        </div>
                        {/* Información específica para jugadores */}
                        {isPurePlayer && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                {getText("Fecha de nacimiento", "birthdate")}
                              </span>
                              <span className="text-gray-800">
                                {profile.birthday ||
                                  getText("No especificada", "notSpecified")}
                              </span>
                            </div>
                          </>
                        )}

                        {/* Información específica para profesionales no jugadores */}
                        {!isPurePlayer &&
                          (profile.role as UserType) !== UserType.RECRUITER && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                {getText("Fecha de nacimiento", "birthdate")}
                              </span>
                              <span className="text-gray-800">
                                {profile.birthday ||
                                  getText("No especificada", "notSpecified")}
                              </span>
                            </div>
                          )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {getText("Nacionalidad", "nationality")}
                          </span>
                          <span className="flex items-center text-gray-800">
                            {profile.nationality &&
                              renderCountryFlag(profile.nationality)}
                            <span className="ml-2">{profile.nationality}</span>
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                          <span className="text-gray-600">
                            {getText(
                              "País de Residencia",
                              "countryOfResidence"
                            )}
                          </span>

                          <span className="flex flex-wrap items-start sm:items-center text-gray-800 text-right sm:text-left sm:justify-end">
                            <span className="flex items-center flex-shrink-0 gap-x-1">
                              {profile.ubicacionActual &&
                                renderCountryFlag(profile.ubicacionActual)}
                              <span>
                                {profile.ubicacionActual}
                                {profile.location && ","}
                              </span>
                            </span>

                            {profile.location && (
                              <span className="ml-1 break-words sm:whitespace-nowrap">
                                {profile.location}
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Pasaporte UE - Para todos los perfiles excepto reclutadores */}
                        {profile.pasaporteUe &&
                          (profile.role as UserType) !== UserType.RECRUITER && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                {getText("Pasaporte UE", "euPassport")}
                              </span>
                              <span className="text-gray-800">
                                {profile.pasaporteUe}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    {(isPurePlayer ||
                      (!isPurePlayer &&
                        (profile.role as UserType) !== UserType.RECRUITER)) && (
                      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                        <h3 className="text-lg font-medium mb-3 text-gray-800">
                          {getText("Contacto", "contact")}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              {getText("Email", "email")}
                            </span>
                            <span className="text-gray-800">
                              {profile.email}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              {getText("Teléfono", "phone")}
                            </span>
                            <PhoneNumberInput
                              mode="view"
                              value={profile.phone}
                              showWhatsAppLink
                              className="text-base text-gray-800"
                            />
                          </div>

                          {isPurePlayer && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                {getText("Agente", "agent")}
                              </span>
                              <span className="flex items-center gap-1 text-gray-800">
                                {profile.nameAgency ? (
                                  profile.nameAgency
                                ) : (
                                  <span className="flex items-center gap-1 bg-green-700 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                    <FaUserSlash className="w-4 h-4" />
                                    {getText("Free Agent", "freeAgent")}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {profile.socialMedia &&
                            Object.keys(profile.socialMedia || {}).length >
                              0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  {getText("Redes sociales", "socialNetworks")}
                                </span>
                                <div className="flex space-x-3">
                                  {(profile.socialMedia?.trasnfermarkt ||
                                    profile.socialMedia?.transfermarkt) && (
                                    <a
                                      href={
                                        profile.socialMedia.trasnfermarkt ||
                                        profile.socialMedia.transfermarkt
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-green-600 hover:text-green-800 transition-colors"
                                      title="Transfermarkt"
                                    >
                                      <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                      >
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                      </svg>
                                    </a>
                                  )}
                                  {(profile.socialMedia?.twitter ||
                                    profile.socialMedia?.x) && (
                                    <a
                                      href={`https://x.com/${
                                        profile.socialMedia.twitter ||
                                        profile.socialMedia.x
                                      }`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-800 hover:text-black transition-colors"
                                      title="X (Twitter)"
                                    >
                                      <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                      >
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                      </svg>
                                    </a>
                                  )}
                                  {profile.socialMedia?.instagram && (
                                    <a
                                      href={`https://instagram.com/${profile.socialMedia.instagram}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-pink-600 hover:text-pink-800 transition-colors"
                                      title="Instagram"
                                    >
                                      <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                      >
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                      </svg>
                                    </a>
                                  )}
                                  {profile.socialMedia?.facebook && (
                                    <a
                                      href={`https://facebook.com/${profile.socialMedia.facebook}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 transition-colors"
                                      title="Facebook"
                                    >
                                      <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                      >
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                      </svg>
                                    </a>
                                  )}
                                  {profile.socialMedia?.youtube && (
                                    <a
                                      href={`https://youtube.com/${profile.socialMedia.youtube}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-red-600 hover:text-red-800 transition-colors"
                                      title="YouTube"
                                    >
                                      <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                      >
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                      </svg>
                                    </a>
                                  )}
                                  {profile.socialMedia?.tiktok && (
                                    <a
                                      href={`https://tiktok.com/@${profile.socialMedia.tiktok}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-800 hover:text-black transition-colors"
                                      title="TikTok"
                                    >
                                      <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                      >
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                      </svg>
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Sección de video */}
                    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                      <h3 className="text-lg font-medium mb-3 text-gray-800">
                        {getText("Video de presentación", "presentationVideo")}
                      </h3>
                      {profile.videoUrl ? (
                        <>
                          <div className="relative pt-[56.25%] bg-gray-100 rounded overflow-hidden">
                            <iframe
                              className="absolute top-0 left-0 w-full h-full"
                              src={formatYoutubeUrl(profile.videoUrl)}
                              title={`Video de ${profile.name} ${profile.lastname}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <a
                              href={profile.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {getText(
                                "Ver video en YouTube",
                                "viewVideoOnYoutube"
                              )}
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="relative pt-[56.25%] bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                              <p className="mt-2 text-sm mb-4">
                                No hay video de presentación
                              </p>
                              {isOwnProfile && (
                                <button
                                  onClick={() =>
                                    router.push(`/user-viewer/${id}?edit=true`)
                                  }
                                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium inline-flex items-center gap-2"
                                  type="button"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 4v16m8-8H4"
                                    />
                                  </svg>
                                  Agregar Video
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === "stats" && (
                  <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                    <h3 className="text-lg font-medium mb-3 text-gray-800">
                      Estadísticas
                    </h3>
                    <p className="text-gray-600">
                      No hay estadísticas disponibles para este jugador.
                    </p>
                  </div>
                )}

                {activeTab === "career" && (
                  <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                    <h3 className="text-lg font-medium mb-3 text-gray-800">
                      Trayectoria profesional
                    </h3>
                    {profile.trayectorias && profile.trayectorias.length > 0 ? (
                      <div className="space-y-4">
                        {sortTrayectoriasByFechaDesc(profile.trayectorias).map(
                          (trayectoria, index) => (
                            <div
                              key={`${trayectoria.club}-${index}`}
                              className="border-l-2 border-green-500 pl-4 pb-4"
                            >
                              <div className="flex justify-between mb-1">
                                <h4 className="font-medium text-gray-800">
                                  {trayectoria.club}
                                </h4>
                                <span className="text-sm text-gray-600">
                                  {formatearFecha(trayectoria.fechaInicio)} -{" "}
                                  {trayectoria.fechaFinalizacion
                                    ? formatearFecha(
                                        trayectoria.fechaFinalizacion
                                      )
                                    : "Present"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {trayectoria.nivelCompetencia} -{" "}
                                {trayectoria.categoriaEquipo}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        No career information available.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botón flotante para contactar (solo en móvil) */}
        {!isOwnProfile && (profile.role as UserType) === UserType.RECRUITER && (
          <div className="fixed bottom-6 left-0 right-0 flex justify-center lg:hidden">
            <div className="bg-gray-100 border border-gray-300 py-3 px-8 rounded-full shadow-lg inline-flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m0-6v4m0-8v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-600">
                No disponible con tu suscripción
              </span>
            </div>
          </div>
        )}
        {!isOwnProfile &&
          (profile.role as UserType) !== UserType.RECRUITER &&
          profile.phone && (
            <div className="fixed bottom-6 left-0 right-0 flex justify-center lg:hidden">
              <a
                href={`https://wa.me/${profile.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white py-3 px-8 rounded-full font-medium shadow-lg hover:bg-green-700 transition-colors inline-flex items-center"
              >
                Contactar
              </a>
            </div>
          )}

        {/* Verification Request Modal */}
        {showVerificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              ref={verificationModalRef}
              className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Solicitar Verificación de Perfil
                </h3>
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  type="button"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Información sobre la verificación */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">
                        ¿Qué es la verificación de perfil?
                      </h4>
                      <p className="text-sm text-blue-700">
                        La verificación de perfil es una insignia que confirma
                        la autenticidad de tu información y te ayuda a destacar
                        ante reclutadores. Hay tres niveles: Amateur,
                        Semiprofesional y Profesional.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formulario de solicitud */}
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="verificationMessage"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mensaje para el administrador (opcional)
                    </label>
                    <textarea
                      value={verificationMessage}
                      id="verificationMessage"
                      onChange={(e) => setVerificationMessage(e.target.value)}
                      placeholder="Explica por qué solicitas la verificación de tu perfil. Por ejemplo: información sobre tu Pais, experiencia profesional, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {verificationMessage.length}/500 caracteres
                    </p>
                  </div>

                  {/* File Upload Section */}
                  <div>
                    <label
                      htmlFor="verificationAttachment"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Adjuntar archivo de evidencia (opcional)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="verificationAttachment"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Subir archivo</span>
                            <input
                              id="verificationAttachment"
                              name="verificationAttachment"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setVerificationAttachment(file);
                                }
                              }}
                            />
                          </label>
                          <p className="pl-1">o arrastra aquí</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX, JPG, PNG hasta 10MB
                        </p>
                        {verificationAttachment && (
                          <div className="mt-2 flex items-center justify-center space-x-2">
                            <svg
                              className="h-5 w-5 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-sm text-green-700">
                              {verificationAttachment.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => setVerificationAttachment(null)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setShowVerificationModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        type="button"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleRequestVerification}
                        type="button"
                        disabled={loadingVerification || uploadingAttachment}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loadingVerification || uploadingAttachment ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            {uploadingAttachment
                              ? "Subiendo archivo..."
                              : "Enviando..."}
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            Enviar Solicitud
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Subscription Modal */}
        <VerificationSubscription
          isOpen={showVerificationSubscriptionModal}
          onClose={() => setShowVerificationSubscriptionModal(false)}
        />
      </div>
    </div>
  );
}
