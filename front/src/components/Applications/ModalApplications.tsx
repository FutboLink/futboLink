import React, { useContext, useEffect, useState } from "react";
import { fetchApplications } from "../Fetchs/AdminFetchs/AdminUsersFetch";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import { IOfferCard } from "@/Interfaces/IOffer";
import { UserType } from "@/Interfaces/IUser";
import Link from "next/link";
import { UserContext } from "../Context/UserContext";
import { fetchUserData } from "../Fetchs/UsersFetchs/UserFetchs";
import { checkUserSubscription } from "@/services/SubscriptionService";
import RecruiterApplicationModal from "../Jobs/RecruiterApplicationModal";

type ModalApplicationProps = {
  jobId: string;
  userId: string;
  jobTitle: string | undefined;
  onClose: () => void;
  typeMessage: boolean;
  isOffer: IOfferCard | undefined;
};

const ModalApplication: React.FC<ModalApplicationProps> = ({
  jobId,
  userId,
  jobTitle,
  onClose,
  typeMessage,
  isOffer,
}) => {
  const message = "Mensaje de aplicación";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationIsError, setNotificationIsError] = useState(false);
  const [userPremium, setUserPremium] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showRecruiterModal, setShowRecruiterModal] = useState(false);
  const { token, user } = useContext(UserContext);

  const refreshSubscriptionStatus = async () => {
    if (token && user && user.email) {
      try {
        // First get basic user data
        const userData = await fetchUserData(token);
        setUserPremium(userData.subscription);
        
        // Then check subscription status directly with Stripe
        const subData = await checkUserSubscription(user.email);
        setHasActiveSubscription(subData.hasActiveSubscription);
        console.log("Subscription status refreshed:", subData);
      } catch (error) {
        console.log("Error al refrescar la suscripción:", error);
        setHasActiveSubscription(false);
      }
    }
  };

  useEffect(() => {
    if (token) {
      refreshSubscriptionStatus();
    }
  }, [token, user]);

  // Escuchar el evento de actualización de suscripción
  useEffect(() => {
    const handleSubscriptionUpdate = (event: CustomEvent) => {
      console.log("Subscription updated event received:", event.detail);
      refreshSubscriptionStatus();
    };

    if (typeof window !== "undefined") {
      window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate as EventListener);
      
      return () => {
        window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate as EventListener);
      };
    }
  }, [token, user]);

  const handleOpenRecruiterModal = () => {
    setShowRecruiterModal(true);
  };

  const handleCloseRecruiterModal = () => {
    setShowRecruiterModal(false);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const showNotificationMessage = (message: string, isError: boolean = false) => {
    setNotificationMessage(message);
    setNotificationIsError(isError);
    setShowNotification(true);
  };

  const handleSubmit = async () => {
    // Evitar múltiples submits
    if (isSubmitting) return;
    
    // Siempre verificar la suscripción actual antes de intentar aplicar
    let canApply = false;
    let subscriptionInfo = null;
    
    if (user && user.email) {
      try {
        // Comprobar explícitamente el tipo de suscripción antes de enviar
        subscriptionInfo = await checkUserSubscription(user.email);
        console.log("Verificando suscripción para aplicar:", subscriptionInfo);
        
        // Verificar si el tipo de suscripción es válido (Semiprofesional o Profesional)
        if (subscriptionInfo.subscriptionType === 'Semiprofesional' || 
            subscriptionInfo.subscriptionType === 'Profesional') {
          canApply = true;
        }
      } catch (error) {
        console.error("Error verificando suscripción:", error);
      }
    }
    
    if (!canApply) {
      showNotificationMessage("Se requiere una suscripción activa Semiprofesional o Profesional para aplicar a trabajos", true);
      return;
    }
    
    setIsSubmitting(true);
    showNotificationMessage("Enviando solicitud...", false);

    try {
      const application = { message, jobId, userId };
      await fetchApplications(application);

      showNotificationMessage("¡Has enviado la solicitud exitosamente!", false);
      
      // Cerrar modal después de 2 segundos en caso de éxito
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error: any) {
      console.error("Error applying:", error);
      let errorMessage = "Error al enviar la solicitud.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.status === 403) {
        errorMessage = "Se requiere una suscripción activa Semiprofesional o Profesional para aplicar";
      } else if (error?.status === 409) {
        errorMessage = "Ya has enviado una solicitud para este trabajo.";
      }

      showNotificationMessage(errorMessage, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="flex flex-col justify-between bg-white rounded-[1.25rem] shadow-lg w-full min-h-[45vh] max-w-[550px] max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-5 border-b">
          <div className="flex items-center justify-between">
            <span className="bg-green-600 text-white text-xs font-medium px-2.5 py-1 rounded">
              {isOffer?.category}
            </span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <h2 className="text-xl font-bold mt-2 text-gray-800">
            Aplicar a la oferta: {jobTitle}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{isOffer?.nationality}</span>
            <span className="mx-1">•</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{isOffer?.contractDurations}</span>
          </div>
        </div>

        {typeMessage ? (
          <div className="px-6 pb-6 pt-2 text-center">
            <div className="flex items-center justify-center mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600 mr-2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <p className="text-gray-700">
                Para aplicar a esta oferta, por favor inicia sesión primero.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/Subs"
                className="flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md px-6 py-2 text-sm font-medium transition-color duration-300 "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.2 7.8l-7.7 7.7-4-4-5.7 5.7"></path>
                  <path d="M15 7h6v6"></path>
                </svg>
                Suscripciones
              </Link>

              <Link
                href="/Login"
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-md px-6 py-2 text-sm font-medium transition-color duration-300 "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Iniciar sesión
              </Link>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/OptionUsers/Player"
                className="text-green-600 hover:underline transition-color duration-300 "
              >
                Regístrate
              </Link>{" "}
              para acceder a todas las ofertas.
            </p>
          </div>
        ) : (
          <div>
            {/* Content based on subscription status */}
            {hasActiveSubscription ? (
              <>
                {/* Active Subscription Info */}
                <div className="m-5 bg-green-50 border border-green-200 p-3 rounded-lg mt-4">
                  <div className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-600 mt-0.5 flex-shrink-0"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        ¡Tienes una suscripción activa!
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Puedes aplicar a esta oferta con tu suscripción actual.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-5 border-t flex flex-col gap-3">
                  {/* Mostrar opciones para reclutadores */}
                  {user && user.role === UserType.RECRUITER && (
                    <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <button
                        onClick={handleOpenRecruiterModal}
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 text-sm font-medium w-full transition-color duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="m19 8 2 2-2 2"></path>
                          <path d="m17 10 2 2-2 2"></path>
                        </svg>
                        Postular jugadores de mi cartera
                      </button>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md px-4 py-2 text-sm font-medium w-full transition-color duration-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className={`flex items-center justify-center gap-2 ${
                        isSubmitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                      } text-white rounded-md px-4 py-2 text-sm font-medium w-full transition-color duration-300`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                          </svg>
                          Aplicar ahora
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Subscription Required Alert */}
                <div className="m-5 bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-amber-500 mt-0.5 flex-shrink-0"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Se requiere una suscripción para aplicar
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Para poder aplicar a esta oferta, necesitas tener una
                        suscripción activa Semiprofesional o Profesional.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t flex flex-col gap-3">
                  {/* Mostrar opciones para reclutadores */}
                  {user && user.role === UserType.RECRUITER && (
                    <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <button
                        onClick={handleOpenRecruiterModal}
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4 py-2 text-sm font-medium w-full transition-color duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="m19 8 2 2-2 2"></path>
                          <path d="m17 10 2 2-2 2"></path>
                        </svg>
                        Postular jugadores de mi cartera
                      </button>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md px-4 py-2 text-sm font-medium w-full transition-color duration-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className={`flex items-center justify-center gap-2 ${
                        isSubmitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                      } text-white rounded-md px-4 py-2 text-sm font-medium w-full transition-color duration-300`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                          </svg>
                          Aplicar ahora
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Notificación */}
            {showNotification && (
              <div className="absolute top-12 left-0 right-0 mx-auto w-max z-50">
                <NotificationsForms message={notificationMessage} isError={notificationIsError} onClose={handleCloseNotification} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para que reclutadores postulen jugadores */}
      {isOffer && (
        <RecruiterApplicationModal
          isOpen={showRecruiterModal}
          onClose={handleCloseRecruiterModal}
          jobId={jobId}
          jobTitle={jobTitle || ''}
        />
      )}
    </div>
  );
};

export default ModalApplication;