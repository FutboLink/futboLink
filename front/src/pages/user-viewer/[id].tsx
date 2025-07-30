import { useRouter } from "next/router";
import { useEffect, useState, useContext, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Head from "next/head";
import { IProfileData, UserType } from "@/Interfaces/IUser";
import { UserContext } from "@/components/Context/UserContext";
import {
  FaArrowLeft,
  FaCog,
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaEllipsisH,
  FaSignOutAlt,
  FaShieldAlt,
  FaUserSlash,
} from "react-icons/fa";
import { renderCountryFlag } from "@/components/countryFlag/countryFlag";
import { getDefaultPlayerImage } from "@/helpers/imageUtils";
import ProfileUser from "@/components/ProfileUser/ProfileUser";
import VerificationBadge from "@/components/VerificationBadge/VerificationBadge";
import {
  requestVerification,
  showVerificationToast,
} from "@/services/VerificationService";
import { toast } from "react-hot-toast";
import PhoneNumberInput from "@/components/utils/PhoneNumberInput";
import {
  formatAchievements,
  formatearFecha,
  sortTrayectoriasByFechaDesc,
} from "@/helpers/sortAndFormatTrayectorias";

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
    if (match && match[1]) {
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
  const { user, token, role } = useContext(UserContext);

  const [profile, setProfile] = useState<IProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationSent, setNotificationSent] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "stats" | "career">(
    "info"
  );
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [loadingVerification, setLoadingVerification] = useState(false);

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
      await requestVerification(
        profile.id,
        { message: verificationMessage },
        token
      );

      showVerificationToast.success(
        "¡Solicitud de verificación enviada exitosamente! Los administradores la revisarán pronto."
      );
      setVerificationMessage("");
      setShowVerificationModal(false);
    } catch (error: any) {
      const errorMessage =
        error.message || "Error al enviar la solicitud de verificación";
      showVerificationToast.error(errorMessage);
    } finally {
      setLoadingVerification(false);
      if (toastId) {
        toast.dismiss(toastId);
      }
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

        // Determinar el tipo de suscripción correcto
        // Primero verificar subscriptionType, luego subscription, y finalmente usar Amateur como fallback
        if (!data.subscriptionType && data.subscription) {
          console.log("Usando valor de subscription:", data.subscription);
          data.subscriptionType = data.subscription;
        } else if (!data.subscriptionType) {
          console.log(
            "No se encontró tipo de suscripción, usando Amateur como predeterminado"
          );
          data.subscriptionType = "Amateur";
        } else {
          console.log(
            "Usando subscriptionType existente:",
            data.subscriptionType
          );
        }

        // Asignar el rol del usuario al campo puesto para mostrar en CardProfile
        if (data.role) {
          data.puesto = getRoleDisplay(data.role);
        } else if (data.posicion) {
          // Si tiene una posición específica (para jugadores), usar esa
          data.puesto = data.posicion;
        }

        // Actualizar estado
        setProfile(data);
        setLoading(false);

        // Enviar notificación de visualización de perfil
        if (!notificationSent) {
          sendProfileViewNotification(id);
        }
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
        <Navbar />
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
        <Navbar />
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
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center mt-20">
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 px-4 py-3 rounded mb-4">
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
        <Navbar />
        <div className="container mx-auto px-4 mt-5">
          <div className="relative flex items-center justify-center py-2">
            {/* Botón alineado a la izquierda */}
            <div className="absolute left-0 top-1">
              <button
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
  const currentClub =
    profile.trayectorias && profile.trayectorias.length > 0
      ? profile.trayectorias[0]
      : null;

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

      <Navbar />

      {/* Powered by logo - sticky debajo de navbar */}
      <div className="sticky top-20 left-0 right-0 z-40 bg-white shadow-sm py-1">
        <div className="flex justify-center items-center">
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
        {isOwnProfile && (
          <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3 mb-4">
            {/* Editar perfil */}
            <button
              onClick={() => router.push(`/user-viewer/${id}?edit=true`)}
              className="w-full sm:w-auto bg-verde-oscuro text-white py-2 px-4 rounded-md hover:bg-verde-mas-claro transition-colors flex items-center justify-center"
            >
              <FaCog className="mr-2" /> Editar perfil
            </button>

            {/* Cambiar contraseña */}
            <button
              onClick={() =>
                router.push(
                  `/forgotPassword?email=${encodeURIComponent(
                    profile?.email || ""
                  )}`
                )
              }
              className="w-full sm:w-auto bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6h-7a6 6 0 01-6-6 6 6 0 016-6h7a6 6 0 016 6z"
                />
              </svg>
              Cambiar contraseña
            </button>

            {/* Cerrar sesión */}
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              <FaSignOutAlt className="mr-2" /> Cerrar sesión
            </button>
          </div>
        )}

        {/* Layout para desktop: 2 columnas */}
        <div className="lg:flex lg:gap-8">
          {/* Columna izquierda - Información del perfil */}
          <div className="lg:w-1/3">
            {/* Header con información del usuario */}
            <div className="pt-8 pb-4 px-4 from-gray-100 bg-white rounded-lg shadow-sm mb-4">
              <div className="flex items-center mb-2">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
                    <Image
                      src={
                        user?.imgUrl ||
                        profile.imgUrl ||
                        getDefaultPlayerImage(profile.genre)
                      }
                      alt={`${profile.name} ${profile.lastname}`}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {(profile.role as any) === "RECRUITER" && (
                    <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                  )}
                  {profile.subscriptionType === "Profesional" &&
                    profile.role &&
                    profile.role.toString() !== "RECRUITER" && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    {profile.nationality && (
                      <span className="mr-2">
                        {renderCountryFlag(profile.nationality)}
                      </span>
                    )}
                    <h2 className="text-xl font-medium text-gray-600">
                      {profile.name}
                    </h2>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {profile.lastname}
                  </h1>
                  {profile.role === UserType.RECRUITER && (
                    <p className="text-sm text-purple-600 font-medium">
                      Agencia/Reclutador
                    </p>
                  )}
                  {/* Verification Badge */}
                  {profile.isVerified && (
                    <div className="mt-1">
                      <VerificationBadge
                        isVerified={true}
                        showText={true}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Estado, edad y tipo de suscripción - Solo para jugadores */}
              {profile.role !== UserType.RECRUITER && (
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>{profile.primaryPosition}</span>
                  </div>
                  <span className="mx-2">|</span>
                  <span>{profile.age} años</span>
                  <span className="mx-2">|</span>
                  <span>{profile.subscriptionType}</span>
                </div>
              )}

              {/* Información básica para reclutadores */}
              {profile.role === UserType.RECRUITER && (
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
                >
                  {urlCopied ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
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
                >
                  <FaShareAlt className="text-gray-500 text-lg" />
                  <span className="text-xs text-gray-500 mt-1 font-medium">
                    Compartir
                  </span>
                </button>

                {/* Verification Button */}
                {isOwnProfile && !profile.isVerified && token && (
                  <button
                    className="flex flex-col items-center justify-center p-2 transition-colors duration-200 hover:bg-gray-50 rounded-lg"
                    onClick={() => setShowVerificationModal(true)}
                  >
                    <svg
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs text-yellow-500 mt-1 font-medium">
                      Verificar
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
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-red-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
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
                          >
                            <FaCog className="h-5 w-5 text-gray-600" />
                            <span className="text-sm">Editar perfil</span>
                          </button>
                        )}
                        {isOwnProfile && (
                          <button
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-left w-full"
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
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6h-7a6 6 0 01-6-6 6 6 0 016-6h7a6 6 0 016 6z"
                              />
                            </svg>
                            <span className="text-sm">Cambiar contraseña</span>
                          </button>
                        )}
                        {isOwnProfile && (
                          <button
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-left w-full"
                            onClick={handleLogout}
                          >
                            <FaSignOutAlt className="h-5 w-5 text-red-600" />
                            <span className="text-sm">Cerrar sesión</span>
                          </button>
                        )}
                        {isOwnProfile && !profile.isVerified && (
                          <button
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-left w-full"
                            onClick={() => setShowVerificationModal(true)}
                          >
                            <svg
                              className="w-5 h-5 text-yellow-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm">
                              Solicitar Verificación
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Club actual - Solo para jugadores */}
            {currentClub && profile.role !== UserType.RECRUITER && (
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

            {/* Agente/Representación - Solo para jugadores */}
            {profile.role === UserType.PLAYER && (
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
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    ) : (
                      <FaUserSlash className="w-7 h-7 text-red-500" />
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
                          <span className="text-red-600 font-medium">
                            Sin representación
                          </span>
                          <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                            Agente libre
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Estadísticas principales - Solo para jugadores */}
            {profile.role && profile.role.toString() !== "RECRUITER" && (
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mb-4">
                <div className="flex justify-between items-center">
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
                </div>
              </div>
            )}

            {/* Información de contacto para reclutadores */}
            {profile.role === UserType.RECRUITER && (
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mb-4">
                <h3 className="text-lg font-medium mb-3 text-gray-800">
                  Información de contacto
                </h3>
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-600 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m0-6v4m0-8v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Información restringida
                        </p>
                        <p className="text-xs text-yellow-700">
                          Los datos de contacto de agencias no están disponibles
                          con tu suscripción actual.
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
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-sm text-gray-500">Teléfono</span>
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
                        <span className="text-sm text-gray-500">Ubicación</span>
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
              {!isOwnProfile && profile.role === UserType.RECRUITER && (
                <div className="w-full bg-gray-100 border border-gray-300 py-3 px-8 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
                profile.role !== UserType.RECRUITER &&
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
                profile.role !== UserType.RECRUITER &&
                !profile.phone && (
                  <div className="text-center text-gray-500 text-sm">
                    Este usuario no ha proporcionado un número de teléfono para
                    contacto.
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
                      {profile.role === UserType.RECRUITER
                        ? "Información de la agencia"
                        : "Información personal"}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre completo</span>
                        <span className="text-gray-800">
                          {profile.name} {profile.lastname}
                        </span>
                      </div>
                      {profile.role !== UserType.RECRUITER && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Fecha de nacimiento
                            </span>
                            <span className="text-gray-800">
                              {profile.birthday || "No especificada"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Altura</span>
                            <span className="text-gray-800">
                              {profile.height
                                ? `${profile.height} cm`
                                : "No especificada"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Peso</span>
                            <span className="text-gray-800">
                              {profile.weight
                                ? `${profile.weight} kg`
                                : "No especificado"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pie hábil</span>
                            <span className="text-gray-800">
                              {profile.skillfulFoot || "No especificado"}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nacionalidad</span>
                        <span className="flex items-center text-gray-800">
                          {profile.nationality &&
                            renderCountryFlag(profile.nationality)}
                          <span className="ml-2">{profile.nationality}</span>
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                        <span className="text-gray-600">
                          País de Residencia
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

                      {profile.pasaporteUe && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pasaporte UE</span>
                          <span className="text-gray-800">
                            {profile.pasaporteUe}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                    <h3 className="text-lg font-medium mb-3 text-gray-800">
                      Contacto
                    </h3>
                    {profile.role === UserType.RECRUITER ? (
                      <div className="space-y-3">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-yellow-600 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m0-6v4m0-8v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-yellow-800">
                                Información restringida
                              </p>
                              <p className="text-xs text-yellow-700">
                                Los datos de contacto no están disponibles con
                                tu suscripción actual.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Email</span>
                          <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                            ●●●●●●●●
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Teléfono</span>
                          <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                            ●●●●●●●●
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email</span>
                          <span className="text-gray-800">{profile.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Teléfono</span>
                          <PhoneNumberInput
                            mode="view"
                            value={profile.phone}
                            showWhatsAppLink
                            className="text-base text-gray-800"
                          />
                        </div>

                        {profile.role === UserType.PLAYER && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Agente</span>
                            <span className="flex items-center gap-1 text-gray-800">
                              {profile.nameAgency ? (
                                profile.nameAgency
                              ) : (
                                <span className="flex items-center gap-1 bg-green-700 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                  <FaUserSlash className="w-4 h-4" />
                                  Agente libre
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {/* Campo de agente movido a una sección destacada arriba */}
                        {profile.socialMedia &&
                          Object.keys(profile.socialMedia || {}).length > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Redes sociales
                              </span>
                              <div className="flex space-x-2">
                                {profile.socialMedia?.transfermarkt && (
                                  <a
                                    href={profile.socialMedia.transfermarkt}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600"
                                  >
                                    Transfermarkt
                                  </a>
                                )}
                                {profile.socialMedia?.x && (
                                  <a
                                    href={`https://x.com/${profile.socialMedia.x}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500"
                                  >
                                    X
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                  {/* Sección de video */}
                  {profile.videoUrl && (
                    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                      <h3 className="text-lg font-medium mb-3 text-gray-800">
                        Video de presentación
                      </h3>
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
                      {/* Mostrar la URL original como fallback en caso de problemas */}
                      <div className="mt-2 text-xs text-gray-500">
                        <a
                          href={profile.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Ver video en YouTube
                        </a>
                      </div>
                    </div>
                  )}
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
                            key={index}
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
                            {trayectoria.logros && (
                              <div className="text-sm text-gray-700 mt-1">
                                <p className="font-medium">Logros:</p>
                                <div className="mt-1 space-y-1">
                                  {formatAchievements(trayectoria.logros).map(
                                    (line, i) => (
                                      <p key={i}>{line}</p>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
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

        {/* Botón flotante para contactar (solo en móvil) */}
        {!isOwnProfile && profile.role === UserType.RECRUITER && (
          <div className="fixed bottom-6 left-0 right-0 flex justify-center lg:hidden">
            <div className="bg-gray-100 border border-gray-300 py-3 px-8 rounded-full shadow-lg inline-flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
          profile.role !== UserType.RECRUITER &&
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
                    className="w-6 h-6 mr-2 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
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
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">
                        ¿Qué es la verificación de perfil?
                      </h4>
                      <p className="text-sm text-yellow-700">
                        La verificación de perfil es una insignia dorada que
                        confirma la autenticidad de tu información y te ayuda a
                        destacar ante reclutadores.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Formulario de solicitud */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje para el administrador (opcional)
                    </label>
                    <textarea
                      value={verificationMessage}
                      onChange={(e) => setVerificationMessage(e.target.value)}
                      placeholder="Explica por qué solicitas la verificación de tu perfil. Por ejemplo: información sobre tus logros, experiencia profesional, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {verificationMessage.length}/500 caracteres
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setShowVerificationModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleRequestVerification}
                        disabled={loadingVerification}
                        className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loadingVerification ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
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
      </div>
    </div>
  );
}
