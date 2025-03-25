"use client";
import React, { useState } from "react";
import { fetchDeleteNotice } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch"; 
import ConfirmDialog from "@/components/Jobs/ConfirmDialog";
import { Notifi } from "@/components/Jobs/Notif";

interface DeleteNoticeButtonProps {
  noticeId: string;
  onDelete: () => void; 
}

const DeleteNoticeButton: React.FC<DeleteNoticeButtonProps> = ({ noticeId, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<string>("¿Estás seguro de que deseas eliminar esta notificación?");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null); 
  const [notification, setNotification] = useState<string | null>(null); 

  const handleDelete = async () => {
    setLoading(true);
    setNotification(null);
    setIsSuccess(null);

    try {
      const response = await fetchDeleteNotice(noticeId); // Simulación de eliminación de la notificación
      if (response.ok || response.status === 200) {
        setMessage("Notificación eliminada correctamente.");
        setIsSuccess(true);
        onDelete(); // Actualiza la vista después de eliminar
      } else {
        throw new Error("Error al eliminar la notificación.");
      }
    } catch {
      setMessage("Error al eliminar la notificación.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setShowConfirm(false);
        setNotification(null);
      }, 3000);
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className={`px-4 py-2 text-white rounded-md transition-colors ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
      >
        {loading ? "Eliminando..." : "Eliminar notificación"}
      </button>

      {showConfirm && (
        <ConfirmDialog
          message={message}
          isSuccess={isSuccess}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {notification && <Notifi message={notification || "Mensaje vacío"} />}
    </div>
  );
};

export default DeleteNoticeButton;
