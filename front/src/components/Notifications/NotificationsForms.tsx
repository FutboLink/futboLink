"use client";
import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";

export interface INotificationProps {
  message: string;
  isError?: boolean;
  onClose?: () => void;
}

export const NotificationsForms: React.FC<INotificationProps> = ({
  message,
  isError = false,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Reset visibility when message changes (new notification)
  useEffect(() => {
    setIsVisible(true);
  }, [message]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

const bgColor = isError ? "bg-white" : "bg-white";

const textColor = isError ? "text-red-700" : "text-[#2f6e22]";

const borderColor = isError
  ? "border-red-200"
  : "border-[#dbead4]";

const iconBg = isError
  ? "bg-red-100"
  : "bg-[#eef7ea]";

const iconColor = isError
  ? "text-red-600"
  : "text-[#3d7a26]";

return (
  isVisible && (
    <div
      role="alert"
      className="fixed top-6 right-6 z-[9999] w-[430px] max-w-[92vw] overflow-hidden rounded-2xl border border-[#dbead4] bg-white shadow-2xl animate-in slide-in-from-right duration-300"
    >
      <div className="flex items-start gap-4 p-5">

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            isError ? "bg-red-100" : "bg-[#eef7ea]"
          }`}
        >
          {isError ? (
            <FaExclamationCircle className="text-2xl text-red-600" />
          ) : (
            <FaCheckCircle className="text-2xl text-[#3d7a26]" />
          )}
        </div>

        <div className="flex-1">

          <h3
            className={`text-base font-semibold ${
              isError ? "text-red-700" : "text-[#2f6e22]"
            }`}
          >
            {isError ? "Ha ocurrido un error" : "Cambios guardados"}
          </h3>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            {message}
          </p>

        </div>

        <button
          onClick={handleClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700"
        >
          <FaTimes />
        </button>

      </div>

      <div className="h-1 w-full bg-[#eef7ea]">
        <div
          className={`h-full ${
            isError ? "bg-red-500" : "bg-[#3d7a26]"
          }`}
          style={{
            width: "100%",
            animation: "notificationProgress 4s linear forwards",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes notificationProgress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
);
};
