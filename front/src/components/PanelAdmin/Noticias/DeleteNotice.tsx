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

  const { token } = useContext(UserContext);

  const handleDelete = async () => {
    setLoading(true);
    setNotification(null);
    setIsSuccess(null);
    setError(null);

    console.log("Deleting notice with ID:", noticeId);
    console.log("Using token:", token ? "Token available" : "Token missing");

    if (!token) {
      setError("Token no disponible. Debes iniciar sesión como administrador.");
      setLoading(false);
      return;
    }
   
    try {
      console.log("Calling fetchDeleteNotice...");
      const response = await fetchDeleteNotice(noticeId, token);
      console.log("Delete response:", response);
      
      if (response.ok || response.status === 200) {
        console.log("Delete successful");
        setMessage("Noticia eliminada correctamente.");
        setIsSuccess(true);
        setNotification("Noticia eliminada con éxito");
        // Actualiza la vista después de eliminar
        onDelete(); 
      } else {
        console.log("Delete failed:", response);
        throw new Error("Error al eliminar la noticia.");
      }
    } catch (error) {
      console.error("Error deleting notice:", error);
      setMessage("Error al eliminar la noticia.");
      setIsSuccess(false);
      setError("Ha ocurrido un error al eliminar la noticia. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
      // No cerramos automáticamente el diálogo en caso de error
      if (isSuccess) {
        setTimeout(() => {
          setShowConfirm(false);
        }, 2000);
      }
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
        <div className="fixed bottom-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}
      
      {notification && <Notifi message={notification} />}
    </div>
  );
};

export default DeleteNotice;
