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
import { checkUserSubscription, refreshUserSubscription, clearSubscriptionCache, cancelUserSubscription, forceSyncSubscription, SubscriptionInfo, SyncSubscriptionResult } from "@/services/SubscriptionService";
import LanguageToggle from "@/components/LanguageToggle/LanguageToggle";
import { fetchUserData, getCv } from "@/components/Fetchs/UsersFetchs/UserFetchs";
import dynamic from 'next/dynamic';

// Añadimos una interfaz para las trayectorias
interface Trayectoria {
  club: string;
  fechaInicio: string;
  fechaFinalizacion: string;
  categoriaEquipo: string;
  nivelCompetencia: string;
  logros: string;
}

// Client-side only component for YouTube embed
const YouTubeEmbed = dynamic(() => Promise.resolve(({ url }: { url: string }) => {
  return (
    <div className="relative w-full pt-[56.25%]">
      <iframe
        src={url}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
      ></iframe>
    </div>
  );
}), { ssr: false });

const UserProfile = () => {
  const { token, logOut } = useContext(UserContext);
  const [activeSection, setActiveSection] = useState("profile");
  const [userData, setUserData] = useState<IProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({ 
    hasActiveSubscription: false,
    subscriptionType: 'Amateur'
  });
  const [pendingSubscriptionType, setPendingSubscriptionType] = useState<string | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [localTrayectorias, setLocalTrayectorias] = useState<Trayectoria[]>([]);
  const [loadingCv, setLoadingCv] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  
  // Set isClient to true once component is mounted
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleLogOut = () => {
    logOut();
    router.push("/");
  };
  
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "";
    
    try {
      // Handle different YouTube URL formats
      let videoId = null;
      
      if (url.includes('youtu.be/')) {
        // Short URL format: https://youtu.be/VIDEO_ID
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('/watch?v=')) {
        // Standard URL format: https://www.youtube.com/watch?v=VIDEO_ID
        videoId = new URL(url).searchParams.get('v');
      } else if (url.includes('/embed/')) {
        // Embed URL format: https://www.youtube.com/embed/VIDEO_ID
        videoId = url.split('/embed/')[1].split('?')[0];
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
    }
    
    return "";
  };
  
  // Check for cached subscription data
  useEffect(() => {
    if (!isClient) return; // Only run on client

    try {
      const cachedSubscription = localStorage.getItem('subscriptionInfo');
      if (cachedSubscription) {
        const parsedData = JSON.parse(cachedSubscription);
        console.log('Found cached subscription data:', parsedData);
        setSubscriptionInfo(parsedData);
      }
      
      // Check for cached pending subscription type
      const cachedPendingType = localStorage.getItem('pendingSubscriptionType');
      if (cachedPendingType) {
        console.log('Found cached pending subscription type:', cachedPendingType);
        setPendingSubscriptionType(cachedPendingType);
      }
    } catch (err) {
      console.error('Error reading cached subscription data:', err);
    }
  }, [isClient]); // Add isClient as dependency

  useEffect(() => {
    if (token) {
      // Use fetchUserData to get the data with properly processed trayectorias
      fetchUserData(token)
        .then((data) => {
          // Ensure trayectorias is initialized correctly
          if (!data.trayectorias || !Array.isArray(data.trayectorias)) {
            // If there's legacy data, convert it to the new format
            if (data.club) {
              data.trayectorias = [{
                club: String(data.club || ''),
                fechaInicio: String(data.fechaInicio || ''),
                fechaFinalizacion: String(data.fechaFinalizacion || ''),
                categoriaEquipo: String(data.categoriaEquipo || ''),
                nivelCompetencia: String(data.nivelCompetencia || ''),
                logros: String(data.logros || '')
              }];
            } else {
              // Initialize with empty array if no legacy data
              data.trayectorias = [];
            }
          }
          console.log("User data including trayectorias:", data);
          setUserData(data);
          
          // After fetching user data, check subscription status
          if (data.email) {
            setLoadingSubscription(true);
            
            // Consultar el estado de suscripción directamente desde la nueva API
            fetch(`${apiUrl}/user/subscription/check?email=${encodeURIComponent(data.email)}`)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Error checking subscription: ${response.status}`);
                }
                return response.json();
              })
              .then(subscriptionData => {
                console.log('Received subscription data:', subscriptionData);
                
                // Actualizar estado de la suscripción
                setSubscriptionInfo({
                  hasActiveSubscription: subscriptionData.isActive === true,
                  subscriptionType: subscriptionData.subscriptionType || 'Amateur'
                });
                
                // Guardar en localStorage para uso futuro
                localStorage.setItem('subscriptionInfo', JSON.stringify({
                  hasActiveSubscription: subscriptionData.isActive === true,
                  subscriptionType: subscriptionData.subscriptionType || 'Amateur'
                }));
                
                // Limpiar cualquier estado pendiente
                setPendingSubscriptionType(null);
                localStorage.removeItem('pendingSubscriptionType');
              })
              .catch(err => {
                console.error("Error checking subscription:", err);
                // Mantener valor por defecto
                setSubscriptionInfo({
                  hasActiveSubscription: false,
                  subscriptionType: 'Amateur'
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
  }, [token]);

  // Inicializamos AOS cuando el componente se monta
  useEffect(() => {
    if (!isClient) return;
    AOS.init();
  }, [isClient]);

  // Function to manually refresh subscription status
  const handleRefreshSubscription = async () => {
    if (!userData?.email || !isClient) return;
    
    setLoadingSubscription(true);
    try {
      // Clear cache first to ensure we get fresh data
      clearSubscriptionCache();
      localStorage.removeItem('pendingSubscriptionType');
      
      // Fetch latest subscription data directly from the API
      const response = await fetch(
        `${apiUrl}/user/subscription/check?email=${encodeURIComponent(userData.email)}&_=${new Date().getTime()}`,
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error refreshing subscription: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Refreshed subscription data:', data);
      
      // Update state with new subscription data
      const subInfo = {
        hasActiveSubscription: data.isActive === true,
        subscriptionType: data.subscriptionType || 'Amateur'
      };
      
      setSubscriptionInfo(subInfo);
      localStorage.setItem('subscriptionInfo', JSON.stringify(subInfo));
      
      // Clear any pending subscription state
      setPendingSubscriptionType(null);
      
    } catch (err) {
      console.error("Error refreshing subscription:", err);
    } finally {
      setLoadingSubscription(false);
    }
  };

  // Function to cancel subscription
  const handleCancelSubscription = async () => {
    if (!userData?.email || !isClient) return;
    
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

  // Intentar cargar trayectorias desde localStorage
  useEffect(() => {
    if (!isClient) return; // Only run on client

    try {
      const storedTrayectorias = localStorage.getItem('userTrayectorias');
      if (storedTrayectorias) {
        const parsedTrayectorias = JSON.parse(storedTrayectorias);
        console.log('Trayectorias encontradas en localStorage:', parsedTrayectorias);
        setLocalTrayectorias(parsedTrayectorias);
      }
    } catch (err) {
      console.error('Error al leer trayectorias desde localStorage:', err);
    }
  }, [isClient]); // Add isClient as dependency

  const handleViewCV = async () => {
    if (!userData?.cv || !isClient) return;
    
    try {
      setLoadingCv(true);
      console.log("Intentando abrir CV:", userData.cv);
      
      // Verificar si el cv es un PDF
      const isPdf = userData.cv.toLowerCase().includes('.pdf') || userData.cv.toLowerCase().includes('/pdf/');
      console.log("¿Es un PDF?", isPdf);
      
      try {
        // Usar getCv para obtener la URL accesible del CV
        console.log("Obteniendo URL para CV:", userData.cv);
        const result = await getCv(userData.cv);
        console.log("Resultado obtenido:", result);
        
        // Verificar si el resultado es un objeto con información de PDF
        if (result && typeof result === 'object' && result.type === 'pdf') {
          // Es un PDF de Cloudinary, preguntar al usuario cómo desea visualizarlo
          const viewOption = prompt(
            "Este PDF podría tener restricciones de acceso directo. ¿Cómo deseas visualizarlo?\n\n" +
            "1: Intentar ver directamente (podría fallar)\n" +
            "2: Usar visor de Google Docs (recomendado)\n" +
            "3: Descargar PDF\n\n" +
            "Ingresa el número de tu opción (por defecto: 2):"
          );
          
          switch (viewOption) {
            case "1":
              // Intentar abrir directamente
              window.open(result.directUrl, '_blank');
              break;
            case "3":
              // Descargar el PDF
              window.location.href = result.downloadUrl;
              break;
            case "2":
            default:
              // Usar visor de Google Docs (opción predeterminada)
              window.open(result.googleViewerUrl, '_blank');
              break;
          }
        } else {
          // Para otros tipos de archivos, simplemente abrir en nueva pestaña
          if (typeof result === 'string') {
            window.open(result, '_blank');
          } else {
            console.error("Formato de resultado inesperado:", result);
            throw new Error("Formato de URL inesperado");
          }
        }
      } catch (error) {
        console.error("Error al obtener URL del CV:", error);
        
        // Si falla, intentar con Google Docs Viewer como última opción
        if (userData.cv.startsWith('http://') || userData.cv.startsWith('https://')) {
          console.log("Intentando abrir con Google Docs Viewer:", userData.cv);
          const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(userData.cv)}&embedded=true`;
          window.open(googleViewerUrl, '_blank');
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error al abrir el CV:", error);
      
      // Determinar el mensaje de error según el tipo de error
      let errorMessage = "No se pudo abrir el CV.";
      
      if (error instanceof Error) {
        if (error.message.includes("404") || error.message.includes("not found")) {
          errorMessage = "El archivo CV no se encuentra en el servidor.";
        } else if (error.message.includes("401") || error.message.includes("unauthorized")) {
          errorMessage = "Error 401: No tienes autorización para acceder a este PDF directamente.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Error de conexión. Por favor, verifica tu conexión a internet.";
        } else if (error.message.includes("empty or null")) {
          errorMessage = "La ruta del CV está vacía o no es válida.";
        } else if (error.message.includes("CORS") || error.message.includes("cross-origin")) {
          errorMessage = "Error de seguridad CORS. No se puede acceder al PDF desde este dominio.";
        } else {
          errorMessage += " " + error.message;
        }
      }
      
      // Preguntar si quiere intentar con el visor de Google como último recurso
      if (userData.cv) {
        const isPdfUrl = userData.cv.toLowerCase().includes('.pdf') || userData.cv.toLowerCase().includes('/pdf/');
        if (isPdfUrl) {
          const tryGoogleViewer = window.confirm(
            `${errorMessage}\n\n¿Deseas intentar abrir el PDF con el visor de Google Docs como último recurso?`
          );
          
          if (tryGoogleViewer) {
            const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(userData.cv)}&embedded=true`;
            window.open(googleViewerUrl, '_blank');
            return;
          }
        }
      }
      
      alert(errorMessage);
    } finally {
      setLoadingCv(false);
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
            {isClient && subscriptionInfo.hasActiveSubscription && (
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
        
        {/* Botón Editar Perfil */}
        <Link href={"/profile"}>
          <div className="mt-8 w-full py-2.5 rounded-lg text-white text-center font-bold border-2 border-white hover:bg-white hover:text-gray-700 transition-all duration-300 shadow-sm">
            Editar Perfil
          </div>
        </Link>
        
        <button
          onClick={handleLogOut}
          className="mt-3 w-full py-2.5 rounded-lg text-white text-center font-bold border-2 border-white hover:bg-white hover:text-gray-700 transition-all duration-300"
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
        
        {/* Only render complex content after client-side hydration */}
        {isClient ? (
          <>
        {activeSection === "profile" && (
              <div className="p-6 bg-gray-50 text-gray-700 rounded-lg shadow-sm mt-4" data-aos="fade-up">
                <h3 className="text-2xl font-semibold mb-6 text-[#1d5126] border-b pb-2">Información Personal</h3>

    {/* Contenedor Principal con Flex */}
    <div className="flex flex-col sm:flex-col md:flex-row justify-between gap-6">
      
      {/* Sección de Información y Redes Sociales */}
      <div className="md:w-1/2">
        <div className="flex items-start">
                     
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

                   
                  </div>
                  
                  {/* Columna Derecha: Estado de Suscripción y Video */}
                  <div className="md:w-1/2">
                    {/* Subscription Information */}
                    <div className="mb-4">
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
                                  : pendingSubscriptionType 
                                    ? 'Suscripción Pendiente'
                                    : 'Sin Suscripción Activa'}
                              </span>
                            </div>
                            <p className="text-sm mb-3">
                              Plan: <span className="font-semibold">
                                {pendingSubscriptionType && !subscriptionInfo.hasActiveSubscription
                                  ? `${pendingSubscriptionType} (Pendiente)` 
                                  : subscriptionInfo.subscriptionType}
                              </span>
                            </p>
                            {!subscriptionInfo.hasActiveSubscription && (
                              <div className="mt-2">
                                <Link 
                                  href="/Subs" 
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

{/* Video de Presentación */}
                    <div>
                      <span className="font-medium text-lg mb-4 text-[#1d5126] block border-b pb-1">
                        Video de Presentación
  </span>
                      <div className="relative w-full bg-black shadow-md mt-2 rounded-lg overflow-hidden">
                        {isClient && userData?.videoUrl ? (
                          <YouTubeEmbed url={getYouTubeEmbedUrl(userData.videoUrl)} />
                        ) : (
                          <div className="flex items-center justify-center h-[200px]">
      <p className="text-white text-center p-4">No hay video disponible</p>
                          </div>
    )}
                      </div>
                    </div>
  </div>
</div>

                {/* CV Section */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4 text-[#1d5126] border-b pb-2">Curriculum Vitae</h3>
                  <div className="flex flex-col items-start">
                    {userData?.cv ? (
                      <div className="border border-[#1d5126] bg-[#f5f5f5] p-4 rounded-md w-full md:w-1/2 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-[#1d5126] text-white p-2 rounded-lg mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                                <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z"/>
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-[#1d5126]">Curriculum Vitae</p>
                              <p className="text-xs text-gray-500">Documento PDF/DOC</p>
                            </div>
                          </div>
                          <button 
                            onClick={handleViewCV}
                            disabled={loadingCv}
                            className="bg-[#1d5126] hover:bg-[#3e7c27] text-white px-3 py-1.5 rounded-md text-sm transition-colors duration-200 flex items-center"
                          >
                            {loadingCv ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Cargando...
                              </>
                            ) : "Ver CV"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-gray-300 bg-gray-50 p-4 rounded-md w-full md:w-1/2 mb-4">
                        <div className="flex items-center">
                          <div className="bg-gray-200 text-gray-500 p-2 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                              <path d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-500">No hay CV disponible</p>
                            <p className="text-xs text-gray-500">Puedes agregar tu CV en la sección de editar perfil</p>
                          </div>
    </div>
  </div>
)}

                    <Link href={"/profile"}>
                      <div className="bg-[#1d5126] hover:bg-[#3e7c27] text-white px-4 py-2 rounded-md text-sm transition-colors duration-200 cursor-pointer inline-flex items-center">
                        <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                        </svg>
                        {userData?.cv ? 'Actualizar CV' : 'Agregar CV'}
                      </div>
                    </Link>
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
                  {userData?.height && (
                    <div>
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">Altura</h4>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] text-gray-700 p-3 rounded-md shadow-sm">
                        {userData.height} cm
                      </p>
                    </div>
                  )}
                  {userData?.weight && (
                    <div>
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">Peso</h4>
                      <p className="border border-[#1d5126] bg-[#f5f5f5] text-gray-700 p-3 rounded-md shadow-sm">
                        {userData.weight} kg
          </p>
        </div>
      )}
    </div>
                <div className="bg-gray-300 h-px my-6"></div>
                <h3 className="text-xl font-semibold text-[#1d5126] border-b pb-2 mb-4">Trayectoria</h3>
                
                {/* Primero intentamos mostrar las trayectorias de la API, si no hay usamos las de localStorage */}
                {userData?.trayectorias && userData.trayectorias.length > 0 ? (
                  <div className="space-y-4">
                    {userData.trayectorias.map((experience, index) => (
                      <div key={index} className="border border-[#1d5126] bg-[#f5f5f5] p-4 rounded-md shadow-sm mb-4">
                        <h4 className="font-semibold text-lg text-gray-800">{experience.club || "Club no especificado"}</h4>
                        <div className="flex flex-wrap gap-4 mt-2 text-gray-700">
                          {experience.fechaInicio && (
                            <p className="bg-white px-3 py-1 rounded-full text-sm">
                              <span className="font-medium">Inicio:</span> {new Date(experience.fechaInicio).toLocaleDateString('es-ES')}
                            </p>
                          )}
                          
                          {experience.fechaFinalizacion && (
                            <p className="bg-white px-3 py-1 rounded-full text-sm">
                              <span className="font-medium">Fin:</span> {new Date(experience.fechaFinalizacion).toLocaleDateString('es-ES')}
                            </p>
                          )}
                          
                          {experience.categoriaEquipo && (
                            <p className="bg-white px-3 py-1 rounded-full text-sm">
                              <span className="font-medium">Categoría:</span> {experience.categoriaEquipo}
                            </p>
                          )}
                          
                          {experience.nivelCompetencia && (
                            <p className="bg-white px-3 py-1 rounded-full text-sm">
                              <span className="font-medium">Nivel:</span> {experience.nivelCompetencia}
                            </p>
                          )}
    </div>
                        
                        {experience.logros && (
                          <div className="mt-3 bg-white p-3 rounded-md">
                            <p className="font-medium text-gray-800">Logros:</p>
                            <p className="text-gray-700">{experience.logros}</p>
  </div>
)}
                      </div>
                    ))}
                  </div>
                ) : localTrayectorias && localTrayectorias.length > 0 ? (
                  // Si no hay trayectorias en la API, mostramos las que están en localStorage
                  <div className="space-y-4">
                   
                    
                    {localTrayectorias.map((experience, index) => (
                      <div key={index} className="border border-[#1d5126] bg-[#f5f5f5] p-4 rounded-md shadow-sm mb-4">
                        <h4 className="font-semibold text-lg text-gray-800">{experience.club || "Club no especificado"}</h4>
                        <div className="flex flex-wrap gap-4 mt-2 text-gray-700">
                          {experience.fechaInicio && (
                            <p className="bg-white px-3 py-1 rounded-full text-sm">
                              <span className="font-medium">Inicio:</span> {experience.fechaInicio ? new Date(experience.fechaInicio).toLocaleDateString('es-ES') : ""}
                            </p>
                          )}
                          
                          {experience.fechaFinalizacion && (
                            <p className="bg-white px-3 py-1 rounded-full text-sm">
                              <span className="font-medium">Fin:</span> {experience.fechaFinalizacion ? new Date(experience.fechaFinalizacion).toLocaleDateString('es-ES') : ""}
                            </p>
                          )}
                          
                          {experience.categoriaEquipo && (
                            <p className="bg-white px-3 py-1 rounded-full text-sm">
                              <span className="font-medium">Categoría:</span> {experience.categoriaEquipo}
                            </p>
                          )}
                          
                          {experience.nivelCompetencia && (
                            <p className="bg-white px-3 py-1 rounded-full text-sm">
                              <span className="font-medium">Nivel:</span> {experience.nivelCompetencia}
                            </p>
                          )}
                        </div>
                        
                        {experience.logros && (
                          <div className="mt-3 bg-white p-3 rounded-md">
                            <p className="font-medium text-gray-800">Logros:</p>
                            <p className="text-gray-700">{experience.logros}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : userData?.club ? (
                  <div className="border border-[#1d5126] bg-[#f5f5f5] p-4 rounded-md shadow-sm">
                    <h4 className="font-semibold text-lg text-gray-800">{userData.club || "Club no especificado"}</h4>
                    <div className="flex flex-wrap gap-4 mt-2 text-gray-700">
                      {userData.fechaInicio && (
                        <p className="bg-white px-3 py-1 rounded-full text-sm">
                          <span className="font-medium">Inicio:</span> {new Date(userData.fechaInicio).toLocaleDateString('es-ES')}
                        </p>
                      )}
                      
                      {userData.fechaFinalizacion && (
                        <p className="bg-white px-3 py-1 rounded-full text-sm">
                          <span className="font-medium">Fin:</span> {new Date(userData.fechaFinalizacion).toLocaleDateString('es-ES')}
                        </p>
                      )}
                      
                      {userData.categoriaEquipo && (
                        <p className="bg-white px-3 py-1 rounded-full text-sm">
                          <span className="font-medium">Categoría:</span> {userData.categoriaEquipo}
                        </p>
                      )}
                      
                      {userData.nivelCompetencia && (
                        <p className="bg-white px-3 py-1 rounded-full text-sm">
                          <span className="font-medium">Nivel:</span> {userData.nivelCompetencia}
                        </p>
                      )}
                    </div>
                    
                    {userData.logros && (
                      <div className="mt-3 bg-white p-3 rounded-md">
                        <p className="font-medium text-gray-800">Logros:</p>
                        <p className="text-gray-700">{userData.logros}</p>
                      </div>
                    )}
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
                              : pendingSubscriptionType 
                                ? 'Suscripción Pendiente'
                                : 'Sin Suscripción Activa'}
                          </span>
                        </div>
                        <p className="text-sm mb-3">
                          Plan: <span className="font-semibold">
                            {pendingSubscriptionType && !subscriptionInfo.hasActiveSubscription
                              ? `${pendingSubscriptionType} (Pendiente)` 
                              : subscriptionInfo.subscriptionType}
                          </span>
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
                            href="/Subs" 
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
          </>
        ) : (
          <div className="p-6 bg-white rounded-lg shadow-sm mt-4 flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d5126]"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
