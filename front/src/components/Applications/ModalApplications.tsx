import React, { useContext, useEffect, useState } from "react";
import { fetchApplications } from "../Fetchs/AdminFetchs/AdminUsersFetch";
import { NotificationsForms } from "../Notifications/NotificationsForms";
import { IOfferCard } from "@/Interfaces/IOffer";
import Link from "next/link";
import { UserContext } from "../Context/UserContext";
import { fetchUserData } from "../Fetchs/UsersFetchs/UserFetchs";

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
  const [userPremium, setUserPremium] = useState<string | null>(null);
  const { token } = useContext(UserContext);

  useEffect(() => {
    if (token) {
      fetchUserData(token)
        .then((data) => setUserPremium(data.subscription))
        .catch(() => console.log("Error al cargar los datos."));
    }
  }, [token]);

  const handleSubmit = async () => {
    setNotificationMessage("Enviando solicitud...");
    setShowNotification(true);

    try {
      const application = { message, jobId, userId };
      await fetchApplications(application);

      setNotificationMessage("Has enviado la solicitud.");
      setShowNotification(true);

      setTimeout(() => {
        setShowNotification(false);
        onClose(); // Cerrar modal luego del envío exitoso
      }, 2000);
    } catch (error: any) {
      if (error instanceof Error) {
        setNotificationMessage("Ya has enviado la solicitud.");
      } else if (error?.status === 403) {
        setNotificationMessage(
          "Se requiere una suscripción activa para aplicar"
        );
      } else {
        setNotificationMessage("Error desconocido al enviar la solicitud.");
      }

      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
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
            {userPremium && (
              <>
                {/* Subscription Info */}
                <div className="m-5 bg-gray-100 p-3 rounded-lg mt-4">
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
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Mejora tus posibilidades con una suscripción
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Los usuarios con suscripción Premium tienen 5 veces más
                        posibilidades de ser contactados y acceden a ofertas
                        exclusivas.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Footer */}
                <div className="p-5 border-t flex flex-col sm:flex-row gap-3">
                  <Link
                    href={"/Subs"}
                    className="flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md px-4 py-2 text-sm font-medium w-full transition-color duration-300 "
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
                      <rect
                        x="1"
                        y="4"
                        width="22"
                        height="16"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    Ver planes
                  </Link>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 text-sm font-medium w-full transition-color duration-300 "
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
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    Aplicar ahora
                  </button>
                </div>

                {/* Notificación */}
                {showNotification && (
                  <div className="absolute top-12 left-0 right-0 mx-auto w-max z-50">
                    <NotificationsForms message={notificationMessage} />
                  </div>
                )}
              </>
            )}
            {!userPremium && (
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
                        suscripción activa de cualquier nivel.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t">
                  <Link
                    href={"/Subs"}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 text-sm font-medium w-full"
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
                      <rect
                        x="1"
                        y="4"
                        width="22"
                        height="16"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    Ver planes de suscripción
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalApplication;