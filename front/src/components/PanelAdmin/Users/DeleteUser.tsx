"use client";

import React, { useState } from "react";
import { deleteUser } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";
import { ConfirmationMessage } from "./ConfirmationMessage";
import { NotificationsForms } from "@/components/Notifications/NotificationsForms";

interface DeleteUserProps {
  userId: string | undefined; // ID del usuario a eliminar
  onUserDeleted: (id: string) => void; // Callback para actualizar la lista
}

const DeleteUser: React.FC<DeleteUserProps> = ({ userId, onUserDeleted }) => {
    const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
    
    const confirmDeleteUser = async () => {
        try {
          if (userId) {
            await deleteUser(userId);
            console.log("Usuario eliminado del backend:", userId);
            setNotificationMessage("Usuario eliminado exitosamente");
            onUserDeleted(userId); // Llamamos a la función que actualiza la lista en el componente padre
      
            // Deja el mensaje visible por un tiempo antes de cerrar la confirmación
            setTimeout(() => {
              setIsConfirmationVisible(false);
            }, 2000); // 2 segundos de retraso antes de cerrar el mensaje
          }
        } catch (error) {
          console.error("Error eliminando usuario:", error);
          setNotificationMessage("Error al eliminar usuario");
      
          // Asegúrate de ocultar la confirmación en caso de error
          setTimeout(() => {
            setIsConfirmationVisible(false);
          }, 2000); // 2 segundos de retraso en caso de error
        }
      };
      
  
    return (
      <div>
        <button
          onClick={() => setIsConfirmationVisible(true)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Eliminar Usuario
        </button>
  
        {notificationMessage && <NotificationsForms message={notificationMessage} />}
  
        {isConfirmationVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <ConfirmationMessage
              roleMessage="¿Estás seguro de eliminar este usuario? Esta acción es irreversible"
              onAccept={confirmDeleteUser}
              onCancel={() => setIsConfirmationVisible(false)}
            />
          </div>
        )}
      </div>
    );
  };
  
export default DeleteUser;
