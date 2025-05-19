"use client";
import React, { useState } from "react";

export interface INotificationProps {
  message: string;
  isError?: boolean;
}

export const NotificationsForms: React.FC<INotificationProps> = ({
  message,
  isError = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  const bgColor = isError ? "bg-[#ffebeb8f]" : "bg-[#ffffff8f]";
  const textColor = isError ? "text-red-800" : "text-green-800";
  const borderColor = isError ? "border-red-800" : "border-green-800";
  const hoverColor = isError ? "hover:text-red-600" : "hover:text-green-600";

  return (
    isVisible && (
      <div
        role="alert"
        className={`fixed top-12 right-8 rounded-xl border ${borderColor} ${bgColor} ${textColor} p-4 shadow-lg`}
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