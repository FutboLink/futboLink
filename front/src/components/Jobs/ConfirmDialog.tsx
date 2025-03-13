"use client";
import React, { useEffect, useState } from "react";

interface ConfirmDialogProps {
  message: string;
  isSuccess: boolean | null; // Agregamos el estado de éxito o error
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  message,
  isSuccess,
  onConfirm,
  onCancel,
}) => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  // Calcular la posición central para el modal
  useEffect(() => {
    const calculateCenter = () => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      setPosition({
        top: centerY - 100,
        left: centerX - 150,
      });
    };

    calculateCenter();
    window.addEventListener("resize", calculateCenter);

    return () => {
      window.removeEventListener("resize", calculateCenter);
    };
  }, []);

  if (!position) return null;

  return (
    <div
      className="fixed flex justify-center items-center z-50"
      style={{
        top: position.top + window.scrollY,
        left: position.left + window.scrollX,
      }}
    >
      <div className="bg-gray-200 border-2 border-gray-300 p-6 rounded-lg shadow-lg text-center relative">
        <p className="text-lg text-gray-800">{message}</p>

        {/* Si es éxito o error, mostramos la "X" para cerrar */}
        {isSuccess !== null && (
          <button
            onClick={onCancel}
            className="absolute top-2 right-2 text-xl text-gray-600 hover:text-gray-900"
            aria-label="Cerrar"
          >
            ✖
          </button>
        )}

        {/* Si aún está esperando confirmación, mostramos los botones de confirmar/cancelar */}
        {isSuccess === null && (
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Confirmar
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmDialog;
