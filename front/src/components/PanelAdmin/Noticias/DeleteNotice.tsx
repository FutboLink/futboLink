"use client";
import React, { useContext, useState } from "react";
import { fetchDeleteNotice } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch"; 
import ConfirmDialog from "@/components/Jobs/ConfirmDialog";
import { Notifi } from "@/components/Jobs/Notif";
import { UserContext } from "@/components/Context/UserContext";

interface DeleteNoticeButtonProps {
  noticeId: string;
  onDelete: () => void; 
}

const DeleteNotice: React.FC<DeleteNoticeButtonProps> = ({ noticeId, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<string>("¿Estás seguro/a de que deseas eliminar esta noticia?");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null); 
  const [notification, setNotification] = useState<string | null>(null); 
  const [error, setError] = useState<string | null>(null);

 const {token} = useContext(UserContext)
  const handleDelete = async () => {
    setLoading(true);
    setNotification(null);
    setIsSuccess(null);

    if (!token) {
      setError("Token no disponible.");
      setLoading(false);
      return;
    }
   
    try {
      const response = await fetchDeleteNotice(noticeId,token); // Simulación de eliminación de la notificación
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
        {loading ? "Eliminando..." : "Eliminar noticia"}
      </button>

      {showConfirm && (
        <ConfirmDialog
          message={message}
          isSuccess={isSuccess}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
  {error && (
          <p className="col-span-1 md:col-span-2 lg:col-span-3 text-red-500 mt-4">
            {error}
          </p>
        )}
      {notification && <Notifi message={notification || "Mensaje vacío"} />}
    </div>
  );
};

export default DeleteNotice;
