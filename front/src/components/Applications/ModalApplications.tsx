import React, { useState } from 'react';
import { fetchApplications } from '../Fetchs/AdminFetchs/AdminUsersFetch';

type ModalApplicationProps = {
  jobId: string;
  userId: string;  // Recibimos el userId como prop
  onClose: () => void;
};

const ModalApplication: React.FC<ModalApplicationProps> = ({ jobId, userId, onClose }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      alert("Por favor, ingresa un mensaje.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // Verifica el objeto application antes de enviarlo
      const application = { message, jobId, userId };
      console.log('Datos enviados a la API:', application); // Aquí verás qué datos estás enviando
  
      // Llamamos a la función fetchApplications pasando el objeto application
      await fetchApplications(application);
  
      alert('Aplicación enviada correctamente.');
      onClose(); // Cerramos el modal después de enviar la aplicación
    } catch (error: unknown) {
      console.error('Error al enviar la aplicación:', error); // Agregado para verificar el error
  
      if (error instanceof Error) {
        alert('Error en la solicitud: ' + error.message);
      } else {
        alert('Error desconocido');
      }
    }
  
    setIsSubmitting(false);
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
    </div>
  );
};

export default ModalApplication;
