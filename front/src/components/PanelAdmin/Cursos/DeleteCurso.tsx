"use client";
import React, { useState } from "react";
import { fetchDeleteCurso } from "@/components/Fetchs/AdminFetchs/AdminUsersFetch";
import ConfirmDialog from "@/components/Jobs/ConfirmDialog";
import { Notifi } from "@/components/Jobs/Notif";

interface DeleteCursoButtonProps {
  cursoId: string;
  onDelete: () => void; // Callback para actualizar la vista después de eliminar
}

const DeleteCursoButton: React.FC<DeleteCursoButtonProps> = ({ cursoId, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<string>("¿Estás seguro de que deseas eliminar este curso?");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null); // Resultado de la eliminación
  const [notification, setNotification] = useState<string | null>(null); // Notificación

  const handleDelete = async () => {
    setLoading(true);
    setNotification(null);
    setIsSuccess(null);

    try {
      const response = await fetchDeleteCurso(cursoId); // Simulación de eliminación del curso
      if (response.ok || response.status === 200) {
        setMessage("Curso eliminado correctamente.");
        setIsSuccess(true);
        onDelete(); // Actualiza la vista después de eliminar
      } else {
        throw new Error("Error al eliminar el curso.");
      }
    } catch {
      setMessage("Error al eliminar el curso.");
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
        {loading ? "Eliminando..." : "Eliminar curso"}
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

export default DeleteCursoButton;
