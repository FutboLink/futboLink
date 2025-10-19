"use client";

import AOS from "aos";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import "aos/dist/aos.css";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { FaGlobe } from "react-icons/fa";
import { FaBolt, FaUsers } from "react-icons/fa6";
import { renderCountryFlag } from "@/components/countryFlag/countryFlag";
import { UserContext } from "@/components/Context/UserContext";
import { getOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";
import { fetchUserId } from "@/components/Fetchs/UsersFetchs/UserFetchs";
import FormComponent from "@/components/Jobs/CreateJob";
import JobOfferDetails from "@/components/Jobs/JobOffertDetails";
import PhoneNumberInput from "@/components/utils/PhoneNumberInput";
import type { IOfferCard } from "@/Interfaces/IOffer";
import type { IProfileData } from "@/Interfaces/IUser";

const PanelManager = () => {
  const { user, token } = useContext(UserContext);
  const searchParams = useSearchParams();
  const sectionParam = searchParams?.get("section") || "profile";
  const [activeSection, setActiveSection] = useState(sectionParam || "profile");
  const [userData, setUserData] = useState<IProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<IOfferCard[]>([]);
  const [portfolioPlayers, setPortfolioPlayers] = useState<any[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    hasActiveSubscription: boolean;
    subscriptionType: string;
  }>({
    hasActiveSubscription: false,
    subscriptionType: "Gratuito",
  });
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Inicializamos AOS para animaciones
  useEffect(() => {
    AOS.init();
  }, []);

  // Actualizar sección activa cuando cambie el parámetro URL
  useEffect(() => {
    if (sectionParam) {
      setActiveSection(sectionParam);
    }
  }, [sectionParam]);

  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          const data = await fetchUserId(user.id);
          setUserData(data);

          // After fetching user data, check subscription status
          if (data.email) {
            setLoadingSubscription(true);

            // Consultar el estado de suscripción directamente desde la API
            fetch(
              `${apiUrl}/user/subscription/check?email=${encodeURIComponent(
                data.email
              )}`
            )
              .then((response) => {
                if (!response.ok) {
                  throw new Error(
                    `Error checking subscription: ${response.status}`
                  );
                }
                return response.json();
              })
              .then((subscriptionData) => {
                console.log(
                  "Received subscription data for manager:",
                  subscriptionData
                );

                // Actualizar estado de la suscripción
                const subscriptionType =
                  subscriptionData.subscriptionType || "Amateur";
                // Convertir nombres de suscripción para managers
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

                // Guardar en localStorage para uso futuro
                localStorage.setItem(
                  "managerSubscriptionInfo",
                  JSON.stringify({
                    hasActiveSubscription: subscriptionData.isActive === true,
                    subscriptionType: displayType,
                  })
                );
              })
              .catch((err) => {
                console.error("Error checking manager subscription:", err);
                // Mantener valor por defecto
                setSubscriptionInfo({
                  hasActiveSubscription: false,
                  subscriptionType: "Gratuito",
                });
              })
              .finally(() => {
                setLoadingSubscription(false);
              });
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          setError("No se pudo cargar los datos.");
          setLoadingSubscription(false);
        }
      }
    };
    loadUserData();
  }, [user, apiUrl]);

  useEffect(() => {
    const loadAppliedJobs = async () => {
      if (user?.id) {
        try {
          const jobs = await getOfertas();
          console.log("Ofertas obtenidas:", jobs);
          const filteredJobs = jobs.filter(
            (job) => job.recruiter && job.recruiter.id === user.id
          );
          setAppliedJobs(filteredJobs);
        } catch (error) {
          console.error("Error loading applied jobs:", error);
          setError("Error al obtener las ofertas.");
        }
      }
    };
    loadAppliedJobs();
  }, [user]);

  // Función para cargar la Portafolio de jugadores
  const loadPortfolio = async () => {
    if (!user || !token) return;

    setLoadingPortfolio(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}/portfolio`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPortfolioPlayers(response.data || []);
    } catch (error) {
      console.error("Error al cargar la Portafolio de jugadores:", error);
      toast.error("Error al cargar tu Portafolio de jugadores");
    } finally {
      setLoadingPortfolio(false);
    }
  };

  // Función para eliminar un jugador de la Portafolio
  const removeFromPortfolio = async (playerId: string) => {
    if (!user || !token) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}/portfolio/${playerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Actualizar la lista de jugadores en la Portafolio
      setPortfolioPlayers((prev) =>
        prev.filter((player) => player.id !== playerId)
      );
      toast.success("Jugador eliminado de tu Portafolio");
    } catch (error) {
      console.error("Error al eliminar jugador de la Portafolio:", error);
      toast.error("Error al eliminar jugador de la Portafolio");
    }
  };

  // Cargar la Portafolio de jugadores al montar el componente
  useEffect(() => {
    if (user && token) {
      loadPortfolio();
    }
  }, [user, token]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Actualizar la URL sin recargar la página
    router.push(`/PanelUsers/Manager?section=${section}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Powered by logo */}
      <div className="sticky left-0 right-0 bg-white shadow-sm py-1">
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

      {/* Contenido principal */}
      <div className="pt-1 mt-4 container mx-auto px-4 md:px-8 lg:px-12 xl:px-24">
        {/* Layout para desktop: 2 columnas */}
        <div className="lg:flex lg:gap-8">
          {/* Columna izquierda - Card de perfil */}
          <div className="lg:w-1/3">
            <div className="pt-8 pb-4 px-4 bg-white rounded-lg shadow-sm mb-4">
              <div className="flex items-center mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500">
                  <Image
                    src={userData?.imgUrl || "/default-avatar.png"}
                    alt={userData?.name || "Foto de perfil"}
                    width={80}
                    height={80}
                    className="object-cover shadow-lg w-full h-full"
                  />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-medium text-gray-600">
                    {userData?.name}
                  </h2>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {userData?.lastname}
                  </h1>
                  <p className="text-sm text-purple-600 font-medium">
                    Agencia/Reclutador
                  </p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-4">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                <span>{userData?.nameAgency || "Manager"}</span>
                {userData?.ubicacionActual && (
                  <>
                    <span className="mx-2">|</span>
                    <span>{userData.ubicacionActual}</span>
                  </>
                )}
              </div>
            </div>

            {/* Suscripción */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 shadow-md border border-green-200 mb-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Plan de Suscripción</h3>
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
          </div>

          {/* Columna derecha - Tabs */}
          <div className="lg:w-2/3">
            <div className="px-4 mb-4">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveSection("profile")}
                  type="button"
                  className={`flex-1 py-3 text-center ${
                    activeSection === "profile"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-500"
                  }`}
                >
                  Información
                </button>
                <button
                  onClick={() => setActiveSection("appliedOffers")}
                  type="button"
                  className={`flex-1 py-3 text-center ${
                    activeSection === "appliedOffers"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-500"
                  }`}
                >
                  Mis Ofertas
                </button>
                <button
                  onClick={() => setActiveSection("portfolio")}
                  type="button"
                  className={`flex-1 py-3 text-center ${
                    activeSection === "portfolio"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-500"
                  }`}
                >
                  Portafolio
                </button>
              </div>
            </div>

            <div className="px-4 pb-20 lg:pb-8">
              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
                  {error}
                </div>
              )}

        {/* Sección de Perfil */}
        {activeSection === "profile" && (
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
                    {userData?.name} {userData?.lastname}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre de la entidad</span>
                  <span className="text-gray-800">
                    {userData?.nameAgency || "No disponible"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de organización</span>
                  <span className="text-gray-800">
                    {userData?.puesto || "No especificado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Año de fundación</span>
                  <span className="text-gray-800">
                    {userData?.age || "No especificado"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nacionalidad</span>
                  <span className="flex items-center text-gray-800">
                    {userData?.nationality && renderCountryFlag(userData.nationality)}
                    <span className="ml-2">{userData?.nationality || "No disponible"}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">País de Residencia</span>
                  <span className="flex items-center text-gray-800">
                    {userData?.ubicacionActual && renderCountryFlag(userData.ubicacionActual)}
                    <span className="ml-2">{userData?.ubicacionActual || "No disponible"}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Región</span>
                  <span className="text-gray-800">
                    {userData?.location || "No especificada"}
                  </span>
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
              <h3 className="text-lg font-medium mb-3 text-gray-800">
                Contacto
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="text-gray-800">{userData?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Teléfono</span>
                  <PhoneNumberInput
                    mode="view"
                    value={userData?.phone}
                    showWhatsAppLink
                    className="text-base text-gray-800"
                  />
                </div>
                {userData?.socialMedia && Object.keys(userData.socialMedia || {}).length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Redes sociales</span>
                    <div className="flex space-x-3">
                      {userData.socialMedia?.website && (
                        <a
                          href={userData.socialMedia.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Sitio web"
                        >
                          <FaGlobe className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video de Presentación */}
            {userData?.videoUrl && (
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <h3 className="text-lg font-medium mb-3 text-gray-800">
                  Video de Presentación
                </h3>
                <div className="relative w-full bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={userData.videoUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-[350px]"
                    title="Video de presentación"
                  />
                </div>
              </div>
            )}

            {/* CV Section */}
            {userData?.cv && (
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <h3 className="text-lg font-medium mb-3 text-gray-800">
                  Currículum Vitae
                </h3>
                <a
                  href={userData.cv}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                >
                  Ver CV
                </a>
              </div>
            )}

            {/* Botón Editar Perfil */}
            <div className="mt-4">
              <Link href="/profile">
                <button
                  type="button"
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Editar Perfil
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Sección Crear Ofertas */}
        {activeSection === "createOffers" && (
          <section
            className="bg-white p-8 rounded-lg shadow-lg mb-8 max-w-5xl mx-auto"
            data-aos="fade-up"
          >
            <FormComponent />
          </section>
        )}

        {/* Sección Mis Ofertas */}
        {activeSection === "appliedOffers" && (
          <section
            className="bg-white p-8 rounded-lg shadow-lg mb-8 max-w-5xl mx-auto"
            data-aos="fade-up"
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
              <h3 className="text-2xl font-semibold text-[#1d5126]">
                Mis Ofertas Publicadas
              </h3>
              <button
                type="button"
                onClick={() => handleSectionChange("createOffers")}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Crear Oferta
              </button>
            </div>
            {appliedJobs.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <div className="text-gray-500 mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2">No has publicado ninguna oferta aún</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSectionChange("createOffers")}
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Crear mi primera oferta
                </button>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto pr-2 space-y-6">
                {[...appliedJobs]
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((job) => (
                    <div key={job.id} className="cursor-pointer">
                      <JobOfferDetails jobId={job.id || ""} />
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}

        {/* Sección de Configuración */}
        {activeSection === "config" && (
          <section
            className="bg-white p-6 rounded-lg shadow-lg mb-8 max-w-5xl mx-auto"
            data-aos="fade-up"
          >
            <h3 className="text-2xl font-semibold mb-6 text-[#1d5126] border-b border-gray-200 pb-2">
              Configuración
            </h3>
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <Link
                  className="group flex items-center justify-between"
                  href="/forgotPassword"
                >
                  <div>
                    <h4 className="font-semibold text-lg group-hover:text-[#1d5126] transition-colors">
                      Cambiar contraseña
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Actualiza tu contraseña de acceso
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-[#1d5126] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-lg text-gray-700 mb-2">
                  Idioma
                </h4>
                <p className="text-gray-600 text-sm">Español (Por defecto)</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <Link
                  className="group flex items-center justify-between"
                  href="/manager-subscription"
                >
                  <div>
                    <h4 className="font-semibold text-lg group-hover:text-[#1d5126] transition-colors">
                      Suscripción
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Gestiona tu plan de suscripción
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-[#1d5126] transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Sección de Portafolio de Jugadores */}
        {activeSection === "portfolio" && (
          <section
            className="bg-white p-8 rounded-lg shadow-lg mb-8 max-w-5xl mx-auto"
            data-aos="fade-up"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#1d5126]">
                Mi Portafolio de Jugadores
              </h3>
              <button
                type="button"
                onClick={() => {
                  // Verificar si el usuario tiene suscripción adecuada
                  const hasPaidSubscription =
                    subscriptionInfo.subscriptionType === "Profesional" ||
                    subscriptionInfo.subscriptionType === "Semiprofesional";

                  // Redirigir según el tipo de suscripción
                  if (
                    hasPaidSubscription &&
                    subscriptionInfo.hasActiveSubscription
                  ) {
                    router.push("/player-search");
                  } else {
                    // Mostrar toast con mensaje informativo
                    toast.error(
                      "Necesitas una suscripción para acceder a la búsqueda de jugadores"
                    );
                    setTimeout(() => {
                      router.push("/manager-subscription");
                    }, 1000);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Buscar Jugadores
              </button>
            </div>

            {loadingPortfolio ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : portfolioPlayers.length > 0 ? (
              <div className="max-h-[600px] overflow-y-auto pr-2">
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

                      <button
                        onClick={() => removeFromPortfolio(player.id)}
                        type="button"
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200 transition-colors"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-500 mb-4">
                  <FaUsers className="mx-auto text-6xl mb-4 text-gray-400" />
                  <h4 className="text-lg font-semibold text-gray-600">
                    Aún no tienes jugadores en tu Portafolio
                  </h4>
                  <p className="mt-2 text-gray-500">
                    Comienza a agregar jugadores para construir tu Portafolio
                    profesional
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Verificar si el usuario tiene suscripción adecuada
                    const hasPaidSubscription =
                      subscriptionInfo.subscriptionType === "Profesional" ||
                      subscriptionInfo.subscriptionType === "Semiprofesional";

                    // Redirigir según el tipo de suscripción
                    if (
                      hasPaidSubscription &&
                      subscriptionInfo.hasActiveSubscription
                    ) {
                      router.push("/player-search");
                    } else {
                      // Mostrar toast con mensaje informativo
                      toast.error(
                        "Necesitas una suscripción para acceder a la búsqueda de jugadores"
                      );
                      setTimeout(() => {
                        router.push("/manager-subscription");
                      }, 1000);
                    }
                  }}
                  className="inline-block mt-3 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Buscar jugadores
                </button>
              </div>
            )}
          </section>
        )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelManager;
