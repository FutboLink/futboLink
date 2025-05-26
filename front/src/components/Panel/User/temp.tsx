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
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState('');
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
      
      // Construir URL para el visor de Google Docs directamente
      let cvUrl = userData.cv;
      
      // Si no es una URL completa, intentar construirla
      if (!cvUrl.startsWith('http')) {
        if (cvUrl.includes('upload/') || cvUrl.includes('cloudinary')) {
          // Parece ser un path de Cloudinary
          cvUrl = `https://res.cloudinary.com/dagcofbhm/${cvUrl.startsWith('/') ? cvUrl.substring(1) : cvUrl}`;
        }
      }
      
      console.log("URL final del CV:", cvUrl);
      
      // Crear URL para el visor de Google Docs
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(cvUrl)}&embedded=true`;
      console.log("URL del visor de Google:", googleViewerUrl);
      
      // Configurar el visor de PDF integrado
      setPdfViewerUrl(googleViewerUrl);
      setShowPdfViewer(true);
      
    } catch (error) {
      console.error("Error al abrir el CV:", error);
      alert("No se pudo abrir el CV. Por favor, intenta nuevamente más tarde.");
    } finally {
      setLoadingCv(false);
    }
  };

  // Componente para mostrar el PDF en un iframe
  const PdfViewer = () => {
    if (!showPdfViewer) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Visor de PDF</h3>
            <button 
              onClick={() => setShowPdfViewer(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 w-full p-1 bg-gray-100">
            <iframe 
              src={pdfViewerUrl}
              className="w-full h-full border-0"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
          <div className="p-4 border-t flex justify-between">
            <span className="text-sm text-gray-500">
              Si el documento no carga correctamente, intenta refrescar la página o descargarlo.
            </span>
            <a 
              href={pdfViewerUrl.includes('?url=') 
                ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfViewerUrl.split('?url=')[1].split('&')[0])}` 
                : pdfViewerUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Abrir en Google Docs
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen mt-24 text-black bg-gray-50 flex-col sm:flex-row">
      {/* Resto del componente con el contenido existente */}
      {/* ... */}
      
      {/* Visor de PDF */}
      {isClient && <PdfViewer />}
    </div>
  );
};

export default UserProfile; 