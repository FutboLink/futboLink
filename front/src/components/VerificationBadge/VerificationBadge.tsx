import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

interface VerificationBadgeProps {
  isVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  isVerified = false, 
  size = 'md', 
  showText = false,
  className = '' 
}) => {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: {
      icon: 'text-sm',
      text: 'text-xs',
      padding: 'px-2 py-1'
    },
    md: {
      icon: 'text-base',
      text: 'text-sm',
      padding: 'px-3 py-1'
    },
    lg: {
      icon: 'text-lg',
      text: 'text-base',
      padding: 'px-4 py-2'
    }
  };

  const currentSize = sizeClasses[size];

  if (showText) {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white rounded-full ${currentSize.padding} shadow-lg border border-yellow-300 ${className}`}>
        <svg 
          className={`${currentSize.icon} text-white`}
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span className={`font-semibold ${currentSize.text} tracking-wide`}>Perfil Verificado</span>
      </div>
    );
  }

  return (
    <div 
      className={`inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 text-white rounded-full shadow-lg border border-yellow-300 ${className}`}
      title="Perfil verificado"
    >
      <svg 
        className="w-4 h-4 text-white" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
};

export default VerificationBadge; 