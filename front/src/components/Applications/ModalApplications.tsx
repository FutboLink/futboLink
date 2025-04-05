import React, { useState } from 'react';
import { fetchApplications } from '../Fetchs/AdminFetchs/AdminUsersFetch';
import { NotificationsForms } from '../Notifications/NotificationsForms';

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
          setNotificationMessage("Ya has enviado la solicitud.");
          setButtonText("Ya has aplicado");
        } else {
          setNotificationMessage("Error desconocido al enviar la solicitud.");
          setButtonText("Error al enviar");
        }
  
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 2000);
      } finally {
        setIsSubmitting(false);
      }
    }, 500);
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
  
        {/* Botones */}
        <div className="flex justify-end gap-4 mt-4">
          <button
            className="px-5 py-2 rounded-lg bg-white text-gray-700 font-semibold hover:bg-gray-200 transition disabled:opacity-60"
            onClick={handleSubmit}
            disabled={isSubmitting || buttonText !== "Enviar"}
          >
            {buttonText}
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
