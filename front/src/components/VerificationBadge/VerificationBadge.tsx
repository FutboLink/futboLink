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
      <div className={`inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full ${currentSize.padding} shadow-md ${className}`}>
        <FaCheckCircle className={`${currentSize.icon} text-white`} />
        <span className={`font-medium ${currentSize.text}`}>Verificado</span>
      </div>
    );
  }

  return (
    <div 
      className={`inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full shadow-md ${className}`}
      title="Perfil verificado"
    >
      <FaCheckCircle className="text-xs text-white" />
    </div>
  );
};

export default VerificationBadge; 