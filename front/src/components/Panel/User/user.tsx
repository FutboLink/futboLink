"use client";

import Image from "next/image";
import { useState, useEffect, useContext } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { IProfileData } from "@/Interfaces/IUser";
import { UserContext } from "@/components/Context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaBolt, FaCog, FaUser, FaYoutube, FaRegIdCard, FaRegCreditCard } from "react-icons/fa";
import { checkUserSubscription, refreshUserSubscription, clearSubscriptionCache, cancelUserSubscription, SubscriptionInfo } from "@/services/SubscriptionService";
import LanguageToggle from "@/components/LanguageToggle/LanguageToggle";

const UserProfile = () => {
  const { token, logOut } = useContext(UserContext);
  const [activeSection, setActiveSection] = useState("profile");
  const [userData, setUserData] = useState<IProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({ 
    hasActiveSubscription: false,
    subscriptionType: 'Amateur'
  });
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleLogOut = () => {
    logOut();
    router.push("/");
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return ""; // Retorna vacío si no hay URL
  
    const regex = /(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([\w-]+)/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : "";
  };
  
  // Check for cached subscription data
  useEffect(() => {
    try {
      const cachedSubscription = localStorage.getItem('subscriptionInfo');
      if (cachedSubscription) {
        const parsedData = JSON.parse(cachedSubscription);
        console.log('Found cached subscription data:', parsedData);
        setSubscriptionInfo(parsedData);
      }
    } catch (err) {
      console.error('Error reading cached subscription data:', err);
    }
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const userId = JSON.parse(atob(token.split(".")[1])).id;

        if (userId) {
          fetch(`${apiUrl}/user/${userId}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to fetch user data");
              }
              return response.json();
            })
            .then((data) => {
              setUserData(data);
              
              // After fetching user data, check subscription status
              if (data.email) {
                setLoadingSubscription(true);
                
                // Use the refresh function to ensure we get the latest data
                refreshUserSubscription(data.email)
                  .then(subInfo => {
                    setSubscriptionInfo(subInfo);
                    // Update the cache
                    localStorage.setItem('subscriptionInfo', JSON.stringify(subInfo));
                  })
                  .catch(err => {
                    console.error("Error checking subscription:", err);
                    
                    // Fallback to regular check if refresh fails
                    checkUserSubscription(data.email)
                      .then(regularInfo => {
                        setSubscriptionInfo(regularInfo);
                      })
                      .catch(regularErr => {
                        console.error("Error with fallback subscription check:", regularErr);
                      });
                  })
                  .finally(() => {
                    setLoadingSubscription(false);
                  });
              }
            })
            .catch((error) => {
              console.error("Error fetching user data:", error);
              setError("Failed to load user data.");
            });
        }
      } catch (error) {
        setError("Error decoding token or fetching user data.");
        console.error("Error:", error);
      }
    }
  }, [token, apiUrl]);

  // Inicializamos AOS cuando el componente se monta
  useEffect(() => {
    AOS.init();
  }, []);

  // Function to manually refresh subscription status
  const handleRefreshSubscription = async () => {
    if (!userData?.email) return;
    
    setLoadingSubscription(true);
    try {
      // Clear cache first to ensure we get fresh data
      clearSubscriptionCache();
      const freshData = await refreshUserSubscription(userData.email);
      setSubscriptionInfo(freshData);
      localStorage.setItem('subscriptionInfo', JSON.stringify(freshData));
    } catch (err) {
      console.error("Error refreshing subscription:", err);
    } finally {
      setLoadingSubscription(false);
    }
  };

  // Function to cancel subscription
  const handleCancelSubscription = async () => {
    if (!userData?.email) return;
    
    // Ask for confirmation
    const confirmed = window.confirm('¿Estás seguro que deseas cancelar tu suscripción? Perderás acceso a las funciones premium al finalizar el período actual de facturación.');
    
    if (!confirmed) return;
    
    setCancellingSubscription(true);
    setCancelMessage(null);
    
    try {
      const result = await cancelUserSubscription(userData.email);
      
      if (result.success) {
        setCancelMessage({ type: 'success', text: result.message });
        // Refresh subscription data to show updated status
        await handleRefreshSubscription();
      } else {
        setCancelMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setCancelMessage({ 
        type: 'error', 
        text: 'Error al cancelar la suscripción. Por favor, intenta nuevamente más tarde.' 
      });
      console.error('Error canceling subscription:', err);
    } finally {
      setCancellingSubscription(false);
    }
  };

  return (
    <div className="flex min-h-screen mt-24 text-black bg-gray-50 flex-col sm:flex-row">
      {/* Panel izquierdo */}
      <div className="w-full sm:w-72 bg-gradient-to-r from-[#1d5126] to-[#3e7c27] text-white p-6 rounded-t-lg sm:rounded-l-lg shadow-lg sm:shadow-none sm:mr-4">
        <div className="mb-8 flex flex-col items-center space-y-4">
          <div className="relative">
            <Image
              src={
                userData
                  ? userData.imgUrl ||
                    (userData.genre === "Masculino"
                      ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"
                      : userData.genre === "Femenino"
                      ? "https://res.cloudinary.com/dagcofbhm/image/upload/v1740487974/Captura_de_pantalla_2025-02-25_095231_yf60vs.png"
                      : "https://res.cloudinary.com/dagcofbhm/image/upload/v1740488144/Captura_de_pantalla_2025-02-25_095529_gxe0gx.png")
                  : "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"
              }
              alt={userData?.name || "Foto de perfil"}
              width={110}
              height={110}
              className="rounded-full mb-4 md:mb-0 border-4 border-white shadow-md object-cover"
            />
            {subscriptionInfo.hasActiveSubscription && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                <FaRegCreditCard className="text-sm" />
              </div>
            )}
          </div>
           <div className="space-y-2 text-center">
           <h2 className="text-2xl font-semibold">
              {userData?.name} {userData?.lastname}
            </h2>
            <h2 className="text-xl font-semibold">{userData?.puesto}</h2>
            <p className="text-sm opacity-90">{userData?.email}</p>
            
            {/* Subscription Badge */}
            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${
              subscriptionInfo.hasActiveSubscription 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-300 text-gray-700'
            }`}>
              <FaRegIdCard className="mr-1" />
              Plan: {subscriptionInfo.subscriptionType}
            </div>
          </div>
        </div>

        {/* Barra de navegación (pestañas) */}
        <nav className="space-y-2">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => handleSectionChange("profile")}
                className={`w-full py-2.5 px-4 flex items-center space-x-2 text-left rounded-lg transition duration-200 ${
                  activeSection === "profile" 
                    ? "bg-white bg-opacity-20 shadow-sm" 
                    : "hover:bg-green-700 hover:bg-opacity-50"
                }`}
              >
                <FaUser className="text-white text-lg" />
                <span className="text-white">Mi Perfil</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange("skills")}
                className={`w-full py-2.5 px-4 flex items-center space-x-2 text-left rounded-lg transition duration-200 ${
                  activeSection === "skills" 
                    ? "bg-white bg-opacity-20 shadow-sm" 
                    : "hover:bg-green-700 hover:bg-opacity-50"
                }`}
              >
                <FaBolt className="text-white text-lg" />
                <span className="text-white">Información Profesional</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleSectionChange("config")}
                className={`w-full py-2.5 px-4 flex items-center space-x-2 text-left rounded-lg transition duration-200 ${
                  activeSection === "config" 
                    ? "bg-white bg-opacity-20 shadow-sm" 
                    : "hover:bg-green-700 hover:bg-opacity-50"
                }`}
              >
                <FaCog className="text-white text-lg" />
                <span className="text-white">Configuración</span>
              </button>
            </li>
          </ul>
        </nav>
        <button
          onClick={handleLogOut}
          className="mt-8 w-full py-2.5 rounded-lg text-white text-center font-bold border-2 border-white hover:bg-white hover:text-gray-700 transition-all duration-300"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Language Toggle Button */}
      <LanguageToggle />

      {/* Si hay un error, mostramos un mensaje */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      <div className="flex-1 p-1">
        <div className="bg-gray-200 border-l-4 border-verde-oscuro text-gray-700 p-4 max-w-7xl mx-auto text-center rounded-lg shadow-sm">
          <p className="font-semibold text-sm">
            Es importante que completes tus datos y los mantengas actualizados
            para que los reclutadores conozcan más sobre ti.
          </p>
        </div>
        
        {activeSection === "profile" && (
          <div className="p-6 bg-gray-50 text-gray-700 rounded-lg shadow-sm mt-4" data-aos="fade-up">
            {/* Subscription Information */}
            <div className="mb-6">
              <div className={`p-4 rounded-lg shadow-sm ${
                subscriptionInfo.hasActiveSubscription 
                  ? 'bg-green-50 border-l-4 border-green-500' 
                  : 'bg-gray-50 border-l-4 border-gray-400'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-[#1d5126] flex items-center">
                    <FaRegCreditCard className="mr-2" />
                    Estado de Suscripción
                  </h3>
                  <button 
                    onClick={handleRefreshSubscription} 
                    disabled={loadingSubscription}
                    className="text-xs text-[#1d5126] hover:underline flex items-center"
                  >
                    {loadingSubscription ? 'Actualizando...' : 'Actualizar estado'}
                  </button>
                </div>
                {loadingSubscription ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#1d5126] mr-2"></div>
                    <p className="text-sm text-gray-600">Verificando suscripción...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center mb-2">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        subscriptionInfo.hasActiveSubscription ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="font-medium">
                        {subscriptionInfo.hasActiveSubscription 
                          ? 'Suscripción Activa' 
                          : 'Sin Suscripción Activa'}
                      </span>
                    </div>
                    <p className="text-sm mb-3">
                      Plan: <span className="font-semibold">{subscriptionInfo.subscriptionType}</span>
                    </p>
                    {!subscriptionInfo.hasActiveSubscription && (
                      <div className="mt-2">
                        <Link 
                          href="/subs" 
                          className="text-sm text-white bg-[#1d5126] hover:bg-[#3e7c27] px-4 py-2 rounded-md transition-colors duration-200 inline-flex items-center"
                        >
                          <FaRegCreditCard className="mr-1" />
                          Ver planes de suscripción
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <h3 className="text-2xl font-semibold mb-6 text-[#1d5126] border-b pb-2">Información Personal</h3>

            {/* Contenedor Principal con Flex */}
            <div className="flex flex-col sm:flex-col md:flex-row justify-between gap-6">
              
              {/* Sección de Información y Redes Sociales */}
              <div className="md:w-1/2">
                <div className="flex items-start">
                  <Image
                    src={userData?.imgUrl || "https://res.cloudinary.com/dagcofbhm/image/upload/v1740486272/Captura_de_pantalla_2025-02-25_092301_sg5xim.png"}
                    alt={userData?.name || "Foto de perfil"}
                    width={100}
                    height={100}
                    className="rounded-full mb-4 md:mb-0 border-2 border-[#1d5126] object-cover"
                  />
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-[#1d5126]">
                      {userData?.name} {userData?.lastname}
                    </h2>
                    <div className="text-gray-700 mt-2">
                      <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                        <strong>Nacionalidad:</strong> {userData?.nationality || "No disponible"}
                      </p>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                        <strong>Ubicación actual:</strong> {userData?.ubicacionActual || "No disponible"}
                      </p>
          
                      <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                        <strong>Fecha de Nacimiento:</strong> {userData?.birthday || "No disponible"}
                      </p>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                        <strong>Edad:</strong> {userData?.age} años
                      </p>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                        <strong>Género:</strong> {userData?.genre}
                      </p>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] p-2 mb-2 rounded-md shadow-sm">
                        <strong>Teléfono:</strong> {userData?.phone}
                      </p>
            

                      {/* Redes Sociales */}
                      <div className="mt-4">
                        <strong className="text-[#1d5126]">Redes Sociales:</strong>
                        <div className="flex space-x-4 mt-2 items-center">
                          {userData?.socialMedia?.x && (
                            <a href={`https://x.com/${userData.socialMedia.x}`} target="_blank" rel="noopener noreferrer"
                              className="hover:opacity-80 transition-opacity">
                              <Image 
                                src="/logoX.png" 
                                alt="Logo X Futbolink" 
                                width={30} 
                                height={30} 
                                className="w-6 h-6 p-2 rounded-md bg-black shadow-sm" 
                              />
                            </a>
                          )}
                          {userData?.socialMedia?.youtube && (
                            <a href={`https://www.youtube.com/${userData.socialMedia.youtube}`} target="_blank" rel="noopener noreferrer"
                              className="text-red-600 hover:text-red-800 transition-colors">
                              <FaYoutube size={24} />
                            </a>
                          )}
                          {userData?.socialMedia?.transfermarkt && (
                            <a
                              href={`https://www.transfermarkt.com/${userData.socialMedia.transfermarkt}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:opacity-80 transition-opacity"
                            >
                              <Image
                                src="/transfermarkt.png"
                                alt="Transfermarkt"
                                width={60}
                                height={60}
                                className="shadow-sm rounded-sm"
                              />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón Editar Perfil */}
                <Link href={"/profile"}>
                  <div className="rounded border-2 md:w-1/2 text-center bg-[#1d5126] hover:bg-white hover:text-[#1d5126] hover:border-2 hover:border-[#1d5126] cursor-pointer p-2.5 text-white font-bold mt-4 transition-all duration-300 shadow-sm">
                    Editar Perfil
                  </div>
                </Link>
              </div>
              
              {/* Video de Presentación */}
              <div className="md:w-1/2">
                <span className="font-medium text-lg mb-4 text-[#1d5126] block border-b pb-1">
                  Video de Presentación
                </span>
                <div className="relative w-full h-[250px] overflow-hidden rounded-lg bg-black shadow-md mt-2">
                  {userData?.videoUrl ? (
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={getYouTubeEmbedUrl(userData.videoUrl)}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-white text-center p-4">No hay video disponible</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Habilidades */}
        {activeSection === "skills" && (
          <div className="flex-1 p-6 bg-gray-50 text-gary-700 transition-opacity duration-300 rounded-lg shadow-sm mt-4" data-aos="fade-up">
            <h3 className="text-xl font-semibold text-[#1d5126] border-b pb-2 mb-4">Datos Generales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-2">Puesto Principal</h4>
                <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-3 rounded-md shadow-sm">
                  {userData?.primaryPosition || "No especificado"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-2">Puesto Secundario</h4>
                <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-3 rounded-md shadow-sm">
                  {userData?.secondaryPosition || "No especificado"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg text-gray-800 mb-2">Pasaporte UE</h4>
                <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-3 rounded-md shadow-sm">
                  {userData?.pasaporteUe || "No especificado"}
                </p>
              </div>
            </div>
            <div className="bg-gray-300 h-px my-6"></div>
            <h3 className="text-xl font-semibold text-[#1d5126] border-b pb-2 mb-4">Datos Físicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {userData?.skillfulFoot && (
                <div>
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">Pie Hábil</h4>
                  <p className="border border-[#1d5126] text-gray-700 bg-[#f5f5f5] p-3 rounded-md shadow-sm">
                    {userData.skillfulFoot}
                  </p>
                </div>
              )}
              {userData?.bodyStructure && (
                <div>
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">Estructura Corporal</h4>
                  <p className="border border-[#1d5126] bg-[#f5f5f5] text-gray-700 p-3 rounded-md shadow-sm">
                    {userData.bodyStructure}
                  </p>
                </div>
              )}
            </div>
            <div className="bg-gray-300 h-px my-6"></div>
            <h3 className="text-xl font-semibold text-[#1d5126] border-b pb-2 mb-4">Trayectoria</h3>
            
            {userData?.trayectorias && userData.trayectorias.length > 0 ? (
              <div className="space-y-4">
                {userData.trayectorias.map((experience, index) => (
                  <div key={index} className="border border-[#1d5126] bg-[#f5f5f5] p-4 rounded-md shadow-sm mb-4">
                    <h4 className="font-semibold text-lg text-gray-800">{experience.club || "Club no especificado"}</h4>
                    <div className="flex flex-wrap gap-4 mt-2 text-gray-700">
                      {experience.fechaInicio && (
                        <p className="bg-white px-3 py-1 rounded-md border border-gray-200">
                          <span className="font-semibold">Inicio:</span> {experience.fechaInicio}
                        </p>
                      )}
                      {experience.fechaFinalizacion && (
                        <p className="bg-white px-3 py-1 rounded-md border border-gray-200">
                          <span className="font-semibold">Fin:</span> {experience.fechaFinalizacion}
                        </p>
                      )}
                      {experience.categoriaEquipo && (
                        <p className="bg-white px-3 py-1 rounded-md border border-gray-200">
                          <span className="font-semibold">Categoría:</span> {experience.categoriaEquipo}
                        </p>
                      )}
                      {experience.nivelCompetencia && (
                        <p className="bg-white px-3 py-1 rounded-md border border-gray-200">
                          <span className="font-semibold">Nivel:</span> {experience.nivelCompetencia}
                        </p>
                      )}
                    </div>
                    {experience.logros && (
                      <div className="mt-3 bg-white p-3 rounded-md border border-gray-200">
                        <p className="font-semibold">Logros:</p>
                        <p className="text-gray-700">{experience.logros}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay información de trayectoria disponible</p>
            )}
          </div>
        )}

        {/* Sección de Configuración */}
        {activeSection === "config" && (
          <div
            className="bg-white p-6 rounded-lg shadow-sm mb-6 mt-4"
            data-aos="fade-up"
          >
            <h3 className="text-xl font-semibold mb-6 text-[#1d5126] border-b pb-2">Configuración</h3>
            <div className="space-y-8">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Link className="group" href="/forgotPassword">
                  <h4 className="font-semibold text-lg group-hover:underline text-[#1d5126] flex items-center">
                    <FaCog className="mr-2" />
                    Cambiar contraseña
                  </h4>
                  <p className="text-gray-600 mt-1 text-sm">Actualiza tu contraseña para mayor seguridad</p>
                </Link>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold text-lg text-[#1d5126] flex items-center">
                  <FaUser className="mr-2" />
                  Idioma
                </h4>
                <p className="text-gray-600 mt-1">Español (por defecto)</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold text-lg text-[#1d5126] flex items-center">
                  <FaRegCreditCard className="mr-2" />
                  Suscripción
                </h4>
                <div className="mt-3">
                  <div className={`p-4 rounded-lg ${
                    subscriptionInfo.hasActiveSubscription 
                      ? 'bg-green-50 border-l-4 border-green-500' 
                      : 'bg-gray-100 border-l-4 border-gray-400'
                  }`}>
                    <div className="flex items-center mb-2">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        subscriptionInfo.hasActiveSubscription ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="font-medium">
                        {subscriptionInfo.hasActiveSubscription 
                          ? 'Suscripción Activa' 
                          : 'Sin Suscripción Activa'}
                      </span>
                    </div>
                    <p className="text-sm mb-3">
                      Plan actual: <span className="font-semibold">{subscriptionInfo.subscriptionType}</span>
                    </p>
                    
                    {/* Cancel message */}
                    {cancelMessage && (
                      <div className={`p-3 rounded-md mb-3 ${
                        cancelMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cancelMessage.text}
                      </div>
                    )}
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link 
                        href="/subs" 
                        className="text-sm text-white bg-[#1d5126] hover:bg-[#3e7c27] px-4 py-2 rounded-md transition-colors duration-200 inline-flex items-center"
                      >
                        {subscriptionInfo.hasActiveSubscription 
                          ? 'Administrar suscripción' 
                          : 'Ver planes de suscripción'}
                      </Link>
                      <button
                        onClick={handleRefreshSubscription}
                        disabled={loadingSubscription}
                        className="text-sm text-[#1d5126] border border-[#1d5126] hover:bg-[#f0f8f0] px-4 py-2 rounded-md transition-colors duration-200 inline-flex items-center"
                      >
                        {loadingSubscription ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#1d5126] mr-2"></div>
                            Actualizando...
                          </>
                        ) : (
                          'Actualizar estado'
                        )}
                      </button>
                      
                      {/* Cancel subscription button - only show for active paid subscriptions */}
                      {subscriptionInfo.hasActiveSubscription && 
                       subscriptionInfo.subscriptionType !== 'Amateur' && (
                        <button
                          onClick={handleCancelSubscription}
                          disabled={cancellingSubscription}
                          className="text-sm text-red-600 border border-red-600 hover:bg-red-50 px-4 py-2 rounded-md transition-colors duration-200 inline-flex items-center"
                        >
                          {cancellingSubscription ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600 mr-2"></div>
                              Cancelando...
                            </>
                          ) : (
                            'Dar de baja suscripción'
                          )}
                        </button>
                      )}
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
};

export default UserProfile;
