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
        className={`fixed top-24 right-8 rounded-xl border ${borderColor} ${bgColor} ${textColor} p-4 shadow-lg z-50`}
      >
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className={`text-sm font-bold ${textColor}`}>{message}</p>
          </div>

          <button
            onClick={handleClose}
            className={`${textColor} transition ${hoverColor}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    )
  );
};
