"use client"
import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { fetchDeleteJob } from "../Fetchs/UsersFetchs/UserFetchs";
import ConfirmDialog from "./ConfirmDialog";
import { Notifi } from "./Notif";

interface DeleteButtonProps {
  jobId: string;
  token: string;
  onDelete: () => void; // Nueva prop para manejar la eliminación
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ jobId, token, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("¿Estás seguro de que deseas eliminar esta oferta?");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const handleDeleteOffer = async () => {
    setLoading(true);
    setNotification(null);
    setIsSuccess(null);

    try {
      const response = await fetchDeleteJob(token, jobId);
      if (response.ok || response.status === 200) {
        setMessage("Oferta eliminada correctamente.");
        setIsSuccess(true);
        onDelete(); // Llamamos a la función onDelete para actualizar el estado en JobOfferDetails
      } else {
        throw new Error("Error al eliminar la oferta.");
      }
    } catch{
      setMessage("Error al eliminar la oferta.");
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
        className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium ${
          loading 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        <FaTrash className="text-base" />
        <span>{loading ? "Eliminando..." : "Eliminar"}</span>
      </button>

      {showConfirm && (
        <ConfirmDialog
          message={message}
          isSuccess={isSuccess}
          onConfirm={handleDeleteOffer}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {notification && <Notifi message={notification || "Mensaje vacío"} />}
    </div>
  );
};

export default DeleteButton;
