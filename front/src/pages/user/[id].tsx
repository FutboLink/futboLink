import { useRouter } from "next/router";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "@/components/Context/UserContext";
import Navbar from "@/components/navbar/navbar";
import ProfileUser from "@/components/ProfileUser/ProfileUser";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { IProfileData } from "@/Interfaces/IUser";
import {
  FaArrowLeft,
  FaThumbsUp,
  FaBookmark,
  FaShare,
  FaEllipsisV,
} from "react-icons/fa";
import { renderCountryFlag } from "@/components/countryFlag/countryFlag";
import { getDefaultPlayerImage } from "@/helpers/imageUtils";

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

export default function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token } = useContext(UserContext);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<IProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "stats" | "career">(
    "info"
  );

  useEffect(() => {
    // Verificar si el ID de la URL coincide con el ID del usuario logueado
    if (id && user && user.id) {
      setIsOwnProfile(id === user.id);
    } else if (id && !user) {
      // Si hay un ID pero no hay usuario logueado, no es su propio perfil
      setIsOwnProfile(false);
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
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando perfil...</p>
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

  return (
    <>
      <Head>
        <title>
          {isOwnProfile
            ? "Mi Perfil"
            : `${profile.name} ${profile.lastname} - FutboLink`}
        </title>
        <meta
          name="description"
          content={
            isOwnProfile
              ? "Gestiona tu perfil en FutboLink"
              : `Perfil de ${profile.name} ${profile.lastname} - ${
                  profile.puesto || ""
                }`
          }
        />
      </Head>

      {isOwnProfile ? (
        // Si es el propio perfil del usuario, mostrar el componente de edición
        <div className="min-h-screen bg-white">
          <Navbar />
          <div className="container mx-auto px-4 pt-16">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Mi Perfil
            </h1>
            <ProfileUser />
          </div>
        </div>
      ) : (
        // Si es el perfil de otro usuario, mostrar el componente de visualización
        <div className="min-h-screen bg-white mt-24 text-gray-800">
          <Navbar />

          {/* Contenido principal - Ajustado para tener en cuenta la navbar */}
          <div className="pt-1 mt-14 container mx-auto px-4 md:px-8 lg:px-12 xl:px-24">
            {/* Layout para desktop: 2 columnas */}
            <div className="lg:flex lg:gap-8">
              {/* Columna izquierda - Información del perfil */}
              <div className="lg:w-1/3">
                {/* Header con información del jugador */}
                <div className="pt-8 pb-4 px-4 from-gray-100 bg-white rounded-lg shadow-sm mb-4">
                  <div className="flex items-center mb-2">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
                        <Image
                          src={
                            profile.imgUrl ||
                            getDefaultPlayerImage(profile.genre)
                          }
                          alt={`${profile.name} ${profile.lastname}`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      {profile.subscriptionType === "Profesional" && (
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
                    </div>
                  </div>

                  {/* Estado, edad y tipo de suscripción */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <span>{profile.primaryPosition}</span>
                    </div>
                    <span className="mx-2">|</span>
                    <span>{profile.age} años</span>
                    <span className="mx-2">|</span>
                    <span>{profile.subscriptionType}</span>

                    {/* Valoración (simulada) */}
                    <div className="ml-auto bg-gray-100 rounded-full px-3 py-1 flex items-center shadow-sm">
                      <span className="text-gray-500 mr-1">©</span>
                      <span className="font-bold text-gray-800">6.0 M</span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <button className="flex flex-col items-center justify-center p-2">
                      <FaThumbsUp className="text-gray-500" />
                      <span className="text-xs text-gray-500 mt-1">
                        Me gusta
                      </span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2">
                      <FaBookmark className="text-gray-500" />
                      <span className="text-xs text-gray-500 mt-1">
                        Guardar
                      </span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2">
                      <FaShare className="text-gray-500" />
                      <span className="text-xs text-gray-500 mt-1">
                        Compartir
                      </span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2">
                      <FaEllipsisV className="text-gray-500" />
                      <span className="text-xs text-gray-500 mt-1">Más</span>
                    </button>
                  </div>
                </div>

                {/* Club actual */}
                {profile.trayectorias && profile.trayectorias.length > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3 border border-gray-200">
                        {/* Aquí iría el logo del club si está disponible */}
                        <span className="text-2xl font-bold">⚽</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {profile.trayectorias[0].club}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          {profile.nationality && (
                            <span className="mr-1">
                              {renderCountryFlag(profile.nationality)}
                            </span>
                          )}
                          <span>
                            {profile.trayectorias[0].nivelCompetencia ||
                              "Primera división"}
                          </span>
                        </div>
                      </div>
                      <div className="ml-auto">
                        <button className="text-green-600 text-sm font-medium">
                          Ver más
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <span>
                        Hasta{" "}
                        {profile.trayectorias[0].fechaFinalizacion
                          ? new Date(
                              profile.trayectorias[0].fechaFinalizacion
                            ).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "No especificada"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Estadísticas principales */}
                <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 mb-2">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="#22C55E"
                            strokeWidth="2"
                          />
                          <line
                            x1="12"
                            y1="6"
                            x2="12"
                            y2="18"
                            stroke="#22C55E"
                            strokeWidth="2"
                          />
                          <line
                            x1="6"
                            y1="12"
                            x2="18"
                            y2="12"
                            stroke="#22C55E"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">
                        {profile.primaryPosition}
                      </span>
                      <span className="text-xs text-gray-500">
                        {profile.primaryPosition}
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 mb-2">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 12H20"
                            stroke="#22C55E"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M4 12C4 15.3137 6.68629 18 10 18H14C17.3137 18 20 15.3137 20 12C20 8.68629 17.3137 6 14 6H10C6.68629 6 4 8.68629 4 12Z"
                            stroke="#22C55E"
                            strokeWidth="2"
                          />
                          <path
                            d="M12 12C12 13.1046 11.1046 14 10 14C8.89543 14 8 13.1046 8 12C8 10.8954 8.89543 10 10 10C11.1046 10 12 10.8954 12 12Z"
                            fill="#22C55E"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">
                        {profile.skillfulFoot || "DER"}
                      </span>
                      <span className="text-xs text-gray-500">Pie</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 mb-2 flex justify-center items-center text-2xl font-bold text-green-600">
                        {profile.height
                          ? (profile.height / 100).toFixed(2)
                          : "1.67"}
                      </div>
                      <span className="text-sm text-gray-600">Mts</span>
                      <span className="text-xs text-gray-500">Altura</span>
                    </div>
                  </div>
                </div>

                {/* Botón de contacto para desktop (fijo en la columna) */}
                <div className="hidden lg:block">
                  <button className="w-full bg-green-600 text-white py-3 px-8 rounded-lg font-medium shadow-md hover:bg-green-700 transition-colors">
                    Contactar
                  </button>
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
                          Información personal
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Nombre completo
                            </span>
                            <span className="text-gray-800">
                              {profile.name} {profile.lastname}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Fecha de nacimiento
                            </span>
                            <span className="text-gray-800">
                              {profile.birthday || "No especificada"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nacionalidad</span>
                            <span className="flex items-center text-gray-800">
                              {profile.nationality &&
                                renderCountryFlag(profile.nationality)}
                              <span className="ml-2">
                                {profile.nationality}
                              </span>
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
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                        <h3 className="text-lg font-medium mb-3 text-gray-800">
                          Contacto
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email</span>
                            <span className="text-gray-800">
                              {profile.email}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Teléfono</span>
                            <span className="text-gray-800">
                              {profile.phone || "No especificado"}
                            </span>
                          </div>
                          {profile.socialMedia &&
                            Object.keys(profile.socialMedia || {}).length >
                              0 && (
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
                      {profile.trayectorias &&
                      profile.trayectorias.length > 0 ? (
                        <div className="space-y-4">
                          {profile.trayectorias.map((trayectoria, index) => (
                            <div
                              key={index}
                              className="border-l-2 border-green-500 pl-4 pb-4"
                            >
                              <div className="flex justify-between mb-1">
                                <h4 className="font-medium text-gray-800">
                                  {trayectoria.club}
                                </h4>
                                <span className="text-sm text-gray-600">
                                  {new Date(
                                    trayectoria.fechaInicio
                                  ).getFullYear()}{" "}
                                  -
                                  {trayectoria.fechaFinalizacion
                                    ? new Date(
                                        trayectoria.fechaFinalizacion
                                      ).getFullYear()
                                    : "Presente"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {trayectoria.nivelCompetencia} -{" "}
                                {trayectoria.categoriaEquipo}
                              </p>
                              {trayectoria.logros && (
                                <p className="text-sm text-gray-700 mt-1">
                                  Logros: {trayectoria.logros}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">
                          No hay información de trayectoria disponible.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botón flotante para contactar (solo en móvil) */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center lg:hidden">
              <button className="bg-green-600 text-white py-3 px-8 rounded-full font-medium shadow-lg hover:bg-green-700 transition-colors">
                Contactar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
