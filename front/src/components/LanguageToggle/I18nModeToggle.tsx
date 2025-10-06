"use client";

import React from "react";
import { FaCog, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { useI18nMode } from "@/components/Context/I18nModeContext";

interface I18nModeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const I18nModeToggle: React.FC<I18nModeToggleProps> = ({ 
  showLabel = true, 
  className = "" 
}) => {
  const { mode, toggleMode, isNextIntlEnabled } = useI18nMode();
  
  // Ocultar en producción durante la migración
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <FaCog size={14} />
        </div>
      )}
      
      <button
        onClick={toggleMode}
        className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        title={`Cambiar a ${isNextIntlEnabled ? 'Google Translate' : 'Next-Intl'}`}
      >
        {isNextIntlEnabled ? (
          <>
            <FaToggleOn className="text-green-500" size={16} />
            <span className="font-medium text-green-700">Next-Intl</span>
          </>
        ) : (
          <>
            <FaToggleOff className="text-gray-400" size={16} />
            <span className="font-medium text-gray-600">Google Translate</span>
          </>
        )}
      </button>
    </div>
  );
};

export default I18nModeToggle;
