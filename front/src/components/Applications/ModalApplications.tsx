import React, { useState } from 'react';
import { fetchApplications } from '../Fetchs/AdminFetchs/AdminUsersFetch';
import { NotificationsForms } from '../Notifications/NotificationsForms';
import Link from 'next/link';

type ModalApplicationProps = {
  jobId: string;
  userId: string; 
  jobTitle: string;
  onClose: () => void;
};

const ModalApplication: React.FC<ModalApplicationProps> = ({ jobId, userId, jobTitle, onClose }) => {
  const message = "Mensaje de aplicación";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [buttonText, setButtonText] = useState("Enviar");
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);

  const handleSubmit = async () => {
    setNotificationMessage("Enviando solicitud...");
    setButtonText("Enviando...");
    setShowNotification(true);
  
    setTimeout(async () => {
      setIsSubmitting(true);
  
      try {
        const application = { message, jobId, userId };
        await fetchApplications(application);
  
        setNotificationMessage("Has enviado la solicitud.");
        setButtonText("Aplicación enviada");
        setShowNotification(true);
  
        setTimeout(() => {
          setShowNotification(false);
          onClose(); // Cerrar modal luego del envío exitoso
        }, 2000);
      } catch (error: unknown) {
        console.error('Error al enviar la aplicación:', error);
  
        if (error instanceof Error) {
          // Check if the error is about subscription
          if (error.message.includes('suscripción')) {
            setNotificationMessage("Se requiere una suscripción para aplicar a ofertas.");
            setButtonText("Obtener suscripción");
            setSubscriptionRequired(true);
          } else if (error.message.includes('duplicada')) {
            setNotificationMessage("Ya has enviado la solicitud.");
            setButtonText("Ya has aplicado");
          } else {
            setNotificationMessage(error.message || "Error al enviar la solicitud.");
            setButtonText("Error");
          }
        } else {
          setNotificationMessage("Error desconocido al enviar la solicitud.");
          setButtonText("Error al enviar");
        }
  
        setShowNotification(true);
        setTimeout(() => {
          if (!subscriptionRequired) {
            setShowNotification(false);
          }
        }, 2000);
      } finally {
        setIsSubmitting(false);
      }
    }, 500);
  };

  // Redirect to subscription page
  const goToSubscription = () => {
    window.location.href = '/Subs';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-gradient-to-r from-[#1d5126] to-[#3e7c27] rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-fade-in">
        
        {/* Botón de cierre (X) */}
        <button
          className="absolute top-4 right-4 text-white text-2xl hover:text-red-400 font-bold focus:outline-none"
          onClick={onClose}
        >
          &times;
        </button>
  
        {/* Título */}
        <h2 className="text-2xl font-bold text-center text-white mb-6 border-b pb-3">
          Aplicar a la oferta
        </h2>
  
        {/* Subtítulo con el título del trabajo */}
        <div className="text-center mb-6 rounded bg-white border-b p-3">
          <span className="text-xl font-bold text-gray-700">{jobTitle}</span>
        </div>

        {/* Subscription Required Message */}
        {subscriptionRequired && (
          <div className="bg-yellow-100 text-yellow-800 p-4 mb-4 rounded-lg">
            <p className="font-bold mb-2">Se requiere suscripción</p>
            <p className="mb-2">Para poder aplicar a ofertas de trabajo, necesitas una suscripción activa.</p>
            <Link href="/Subs">
              <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
                Ver planes de suscripción
              </button>
            </Link>
          </div>
        )}
  
        {/* Botones */}
        <div className="flex justify-end gap-4 mt-4">
          <button
            className={`px-5 py-2 rounded-lg ${subscriptionRequired ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-white hover:bg-gray-200'} text-gray-700 font-semibold transition disabled:opacity-60`}
            onClick={subscriptionRequired ? goToSubscription : handleSubmit}
            disabled={isSubmitting || (buttonText !== "Enviar" && !subscriptionRequired)}
          >
            {subscriptionRequired ? 'Obtener suscripción' : buttonText}
          </button>
        </div>
      </div>
  
      {/* Notificación */}
      {showNotification && (
        <div className="absolute top-12 left-0 right-0 mx-auto w-max z-50">
          <NotificationsForms message={notificationMessage} />
        </div>
      )}
    </div>
  );
};

export default ModalApplication;
