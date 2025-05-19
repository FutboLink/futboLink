"use client";
import React, { useState } from "react";

export interface INotificationProps {
  message: string;
}

export const NotificationsForms: React.FC<INotificationProps> = ({
  message,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    isVisible && (
      <div
        role="alert"
        className="fixed top-12 right-8 rounded-xl border border-green-800 bg-[#ffffff8f] text-green-800 p-4 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold text-green-800">{message}</p>
          </div>

          <button
            onClick={handleClose}
            className="text-green-800 transition hover:text-green-600"
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