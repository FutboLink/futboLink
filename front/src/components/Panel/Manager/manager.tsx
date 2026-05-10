"use client";

import AOS from "aos";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import "aos/dist/aos.css";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { FaChevronDown, FaChevronUp, FaGlobe } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "@/Styles/help-swiper.css";
import { renderCountryFlag } from "@/components/countryFlag/countryFlag";
import { UserContext } from "@/components/Context/UserContext";
import { getMyOfertas } from "@/components/Fetchs/OfertasFetch/OfertasAdminFetch";
import { fetchUserId } from "@/components/Fetchs/UsersFetchs/UserFetchs";
import FormComponent from "@/components/Jobs/CreateJob";
import JobOfferDetails from "@/components/Jobs/JobOffertDetails";
import ProfileProgressBar from "@/components/ProfileUser/ProfileProgressBar";
import PhoneNumberInput from "@/components/utils/PhoneNumberInput";
import {
  getProfilePhotos,
  getProfileVideos,
} from "@/lib/profileMedia";
import type { IOfferCard } from "@/Interfaces/IOffer";
import type { IProfileData } from "@/Interfaces/IUser";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";
import { FaBriefcase } from "react-icons/fa6";

// Convierte URLs de YouTube de formato watch a embed para que el iframe
// no sea bloqueado por X-Frame-Options. Espejo del helper que usamos en
// user-viewer/[id].tsx.
const formatYoutubeUrl = (url: string): string => {
  if (!url) return url;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  return url;
};

const PanelManager = () => {
  const { user, token } = useContext(UserContext);
  const { isNextIntlEnabled } = useI18nMode();
  const tCommon = useNextIntlTranslations("common");

  // Función para obtener el texto traducido o el texto original
  const getText = (originalText: string, translatedKey: string) => {
    return isNextIntlEnabled ? tCommon.t(translatedKey) : originalText;
  };
  const searchParams = useSearchParams();
  const sectionParam = searchParams?.get("section") || "profile";
  const [activeSection, setActiveSection] = useState(sectionParam || "profile");
  const [userData, setUserData] = useState<IProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Bloque "Información de la agencia" colapsable, cerrado por default.
  const [isAgencyInfoOpen, setIsAgencyInfoOpen] = useState(false);
  // Lightbox de fotos del carrusel multimedia.
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<IOfferCard[]>([]);
  const [jobsPage, setJobsPage] = useState<number>(1);
  const [jobsLimit, setJobsLimit] = useState<number>(10);
  const [jobsTotal, setJobsTotal] = useState<number>(0);
  const [jobsTotalPages, setJobsTotalPages] = useState<number>(0);
  const [jobsLoading, setJobsLoading] = useState<boolean>(false);
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
    if (activeSection !== "appliedOffers") return;
    const loadMyJobs = async () => {
      if (!user?.id || !token) return;
      setJobsLoading(true);
      try {
        const result = await getMyOfertas(token, jobsPage, jobsLimit);
        setAppliedJobs(result.data);
        setJobsTotal(result.total);
        setJobsTotalPages(result.totalPages);
      } catch (err) {
        console.error("Error loading my jobs:", err);
        setError("Error al obtener las ofertas.");
      } finally {
        setJobsLoading(false);
      }
    };
    loadMyJobs();
  }, [activeSection, user, token, jobsPage, jobsLimit]);

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

            {/* Progreso de perfil */}
            {userData && (
              <div className="mb-4">
                <ProfileProgressBar profile={userData} />
              </div>
            )}

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
                        <button
                          onClick={() => setActiveSection("portfolio")}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
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
                  {/* Información de la agencia — colapsable, cerrado por
                      default. Igual que en el perfil del jugador. */}
                  <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsAgencyInfoOpen((v) => !v)}
                      aria-expanded={isAgencyInfoOpen}
                      className="w-full flex items-center justify-between text-left text-lg font-medium text-gray-800 mb-0"
                    >
                      <span>
                        {getText(
                          "Información de la agencia",
                          "agencyInformation"
                        )}
                      </span>
                      <span className="text-gray-500">
                        {isAgencyInfoOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </button>
                    {isAgencyInfoOpen && (
                    <div className="space-y-3 mt-3">
                      {/* "Nombre completo" se sacó: ya está en el header del
                          perfil arriba del bloque, mostrarlo acá era duplicar. */}
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {getText("Año de fundación", "foundingYear")}
                        </span>
                        <span className="text-gray-800">
                          {userData?.age ||
                            getText("No especificado", "notSpecified")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {getText("Nacionalidad", "nationality")}
                        </span>
                        <span className="flex items-center text-gray-800">
                          {userData?.nationality &&
                            renderCountryFlag(userData.nationality)}
                          <span className="ml-2">
                            {userData?.nationality ||
                              getText("No disponible", "notAvailable")}
                          </span>
                        </span>
                      </div>

                      {/* Segunda nacionalidad — del 1B. Solo se renderiza si
                          está cargada. */}
                      {(
                        userData as
                          | (IProfileData & { secondNationality?: string })
                          | null
                      )?.secondNationality && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {getText(
                              "Segunda nacionalidad",
                              "secondNationality",
                            )}
                          </span>
                          <span className="flex items-center text-gray-800">
                            {renderCountryFlag(
                              (
                                userData as IProfileData & {
                                  secondNationality?: string;
                                }
                              ).secondNationality as string,
                            )}
                            <span className="ml-2">
                              {
                                (
                                  userData as IProfileData & {
                                    secondNationality?: string;
                                  }
                                ).secondNationality
                              }
                            </span>
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {getText("País de Residencia", "countryOfResidence")}
                        </span>
                        <span className="flex items-center text-gray-800">
                          {userData?.ubicacionActual &&
                            renderCountryFlag(userData.ubicacionActual)}
                          <span className="ml-2">
                            {userData?.ubicacionActual ||
                              getText("No disponible", "notAvailable")}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {getText("Región", "region")}
                        </span>
                        <span className="text-gray-800">
                          {userData?.location ||
                            getText("No especificada", "notSpecified")}
                        </span>
                      </div>
                    </div>
                    )}
                  </div>

                  {/* Información de contacto */}
                  <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                    <h3 className="text-lg font-medium mb-3 text-gray-800">
                      {getText("Contacto", "contact")}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {getText("Email", "email")}
                        </span>
                        <span className="text-gray-800">{userData?.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {getText("Teléfono", "phone")}
                        </span>
                        <PhoneNumberInput
                          mode="view"
                          value={userData?.phone}
                          showWhatsAppLink
                          className="text-base text-gray-800"
                        />
                      </div>
                      {userData?.socialMedia &&
                        Object.keys(userData.socialMedia || {}).length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              {getText("Redes sociales", "socialNetworks")}
                            </span>
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

                  {/* Multimedia — un solo carrusel combinado con videos +
                      fotos. Mismo patrón que el perfil del jugador:
                      - autoplay solo si son todas fotos
                      - click en foto abre lightbox
                      - pausa videos al cambiar de slide
                      - estilos custom de .profile-media-swiper
                  */}
                  {(() => {
                    if (!userData) return null;
                    const videos = getProfileVideos(userData);
                    const photos = getProfilePhotos(userData);
                    const totalSlides = videos.length + photos.length;
                    if (totalSlides === 0) return null;
                    const shouldAutoplay =
                      videos.length === 0 && photos.length > 1;
                    return (
                      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                        <h3 className="text-lg font-medium mb-3 text-gray-800">
                          {getText("Multimedia", "multimedia")}
                          {totalSlides > 1 && (
                            <span className="text-sm font-normal text-gray-500">
                              {" "}
                              ({totalSlides})
                            </span>
                          )}
                        </h3>
                        <Swiper
                          className="profile-media-swiper"
                          modules={[Navigation, Pagination, Autoplay]}
                          navigation={totalSlides > 1}
                          pagination={
                            totalSlides > 1 ? { clickable: true } : false
                          }
                          autoplay={
                            shouldAutoplay
                              ? {
                                  delay: 4500,
                                  disableOnInteraction: false,
                                  pauseOnMouseEnter: true,
                                }
                              : false
                          }
                          loop={totalSlides > 1}
                          spaceBetween={16}
                          slidesPerView={1}
                          onSlideChange={(swiper) => {
                            swiper.el
                              .querySelectorAll("iframe")
                              .forEach((iframe) => {
                                iframe.contentWindow?.postMessage(
                                  '{"event":"command","func":"pauseVideo","args":""}',
                                  "*",
                                );
                              });
                          }}
                        >
                          {videos.map((url, i) => (
                            <SwiperSlide key={`v-${i}`}>
                              <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
                                <iframe
                                  src={`${formatYoutubeUrl(url)}?enablejsapi=1`}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="absolute top-0 left-0 w-full h-full"
                                  title={`Video ${i + 1}`}
                                />
                              </div>
                            </SwiperSlide>
                          ))}
                          {photos.map((src, i) => (
                            <SwiperSlide key={`p-${i}`}>
                              <button
                                type="button"
                                onClick={() => setLightboxIndex(i)}
                                className="block w-full relative pt-[56.25%] rounded-lg overflow-hidden bg-gray-900 cursor-zoom-in group"
                                aria-label={`Abrir foto ${i + 1} en pantalla completa`}
                              >
                                <Image
                                  src={src}
                                  alt={`Foto ${i + 1}`}
                                  fill
                                  className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                                />
                              </button>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                    );
                  })()}

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
                  {jobsLoading && appliedJobs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Cargando ofertas...
                    </div>
                  ) : appliedJobs.length === 0 ? (
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
                        <p className="mt-2">
                          No has publicado ninguna oferta aún
                        </p>
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
                    <>
                      <div className="space-y-6">
                        {appliedJobs.map((job) => (
                          <div key={job.id} className="cursor-pointer">
                            <JobOfferDetails jobId={job.id || ""} />
                          </div>
                        ))}
                      </div>

                      {/* Paginación */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-200 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>Mostrar</span>
                          <select
                            value={jobsLimit}
                            onChange={(e) => {
                              setJobsLimit(Number(e.target.value));
                              setJobsPage(1);
                            }}
                            className="border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-600"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                          </select>
                          <span>por página</span>
                        </div>

                        <div className="text-gray-600">
                          Página <strong>{jobsPage}</strong> de{" "}
                          <strong>{Math.max(jobsTotalPages, 1)}</strong>
                          {" — "}
                          <strong>{jobsTotal}</strong> ofertas en total
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={jobsPage <= 1 || jobsLoading}
                            onClick={() => setJobsPage((p) => Math.max(1, p - 1))}
                            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            Anterior
                          </button>
                          <button
                            type="button"
                            disabled={
                              jobsPage >= jobsTotalPages || jobsLoading
                            }
                            onClick={() =>
                              setJobsPage((p) =>
                                Math.min(jobsTotalPages, p + 1),
                              )
                            }
                            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            Siguiente
                          </button>
                        </div>
                      </div>
                    </>
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
                      <p className="text-gray-600 text-sm">
                        Español (Por defecto)
                      </p>
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
                      {getText(
                        "Mi Portafolio de Jugadores",
                        "myPlayerPortfolio"
                      )}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        // Verificar si el usuario tiene suscripción adecuada
                        const hasPaidSubscription =
                          subscriptionInfo.subscriptionType === "Profesional" ||
                          subscriptionInfo.subscriptionType ===
                            "Semiprofesional";

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
                      {getText("Buscar Jugadores", "searchPlayers")}
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
                          {getText(
                            "Aún no tienes jugadores en tu Portafolio",
                            "noPlayersInPortfolio"
                          )}
                        </h4>
                        <p className="mt-2 text-gray-500">
                          {getText(
                            "Comienza a agregar jugadores para construir tu Portafolio profesional",
                            "startAddingPlayers"
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // Verificar si el usuario tiene suscripción adecuada
                          const hasPaidSubscription =
                            subscriptionInfo.subscriptionType ===
                              "Profesional" ||
                            subscriptionInfo.subscriptionType ===
                              "Semiprofesional";

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

      {/* Lightbox del carrusel multimedia — mismo patrón que el perfil del
          jugador. Click afuera o en × cierra. */}
      {lightboxIndex !== null &&
        userData &&
        (() => {
          const photos = getProfilePhotos(userData);
          if (!photos[lightboxIndex]) return null;
          const goPrev = () =>
            setLightboxIndex((idx) =>
              idx === null ? null : (idx - 1 + photos.length) % photos.length,
            );
          const goNext = () =>
            setLightboxIndex((idx) =>
              idx === null ? null : (idx + 1) % photos.length,
            );
          return (
            <div
              className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setLightboxIndex(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Vista ampliada de la foto"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(null);
                }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                ×
              </button>

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goPrev();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors"
                    aria-label="Foto anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goNext();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors"
                    aria-label="Foto siguiente"
                  >
                    ›
                  </button>
                </>
              )}

              <div
                className="relative w-full max-w-5xl h-[85vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={photos[lightboxIndex]}
                  alt={`Foto ${lightboxIndex + 1}`}
                  width={1600}
                  height={1200}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  priority
                />
              </div>

              {photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-3 py-1 rounded-full">
                  {lightboxIndex + 1} / {photos.length}
                </div>
              )}
            </div>
          );
        })()}
    </div>
  );
};

export default PanelManager;
