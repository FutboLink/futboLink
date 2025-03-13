import React, { useState } from 'react';
import { fetchApplications } from '../Fetchs/AdminFetchs/AdminUsersFetch';
import { NotificationsForms } from '../Notifications/NotificationsForms';

type ModalApplicationProps = {
  jobId: string;
  userId: string;  // Recibimos el userId como prop
  onClose: () => void;
};

const ModalApplication: React.FC<ModalApplicationProps> = ({ jobId, userId, onClose }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) {
      // Mostrar notificación de error si el mensaje está vacío
      setNotificationMessage("Por favor, ingresa un mensaje.");
      setShowNotification(true);

      // Mantenemos la notificación visible por 2 segundos antes de ocultarla
      setTimeout(() => setShowNotification(false), 2000);
      return;
    }

    // Primero mostramos la notificación de "enviando..."
    setNotificationMessage("Enviando solicitud...");
    setShowNotification(true);

    // Hacemos un setTimeout para asegurar que la notificación se vea
    setTimeout(async () => {
      setIsSubmitting(true);

      try {
        const application = { message, jobId, userId };
        await fetchApplications(application);

        // Si la solicitud fue exitosa, mostramos un mensaje de éxito
        setNotificationMessage("Has enviado la solicitud.");
        setShowNotification(true);

        // Mantenemos la notificación visible por 2 segundos antes de cerrarla
        setTimeout(() => {
          setShowNotification(false);
        }, 2000);

        onClose(); // Cerramos el modal después de enviar la aplicación
      } catch (error: unknown) {
        console.error('Error al enviar la aplicación:', error);

        // Manejo de error en función de si es una instancia de Error o no
        if (error instanceof Error) {
          setNotificationMessage(`Ya has enviado la solicitud.`);
        } else {
          setNotificationMessage("Error desconocido al enviar la solicitud.");
        }

        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 2000);
      } finally {
        setIsSubmitting(false); // Siempre se ejecuta, independientemente de si hubo error o no
      }
    }, 500); // Aseguramos que la notificación se vea antes de iniciar la solicitud
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Aplicar a la Oferta</h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4"
          rows={5}
          placeholder="Escribe tu mensaje..."
        />
        <div className="flex justify-end gap-4">
          <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>

      {showNotification && (
        <div className="absolute top-12 left-0 right-0 mx-auto w-max z-50">
          <NotificationsForms message={notificationMessage} />
        </div>
      )}
    </div>
  );
};

export default ModalApplication;
