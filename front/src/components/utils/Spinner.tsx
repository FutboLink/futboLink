import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-5 w-5 border-t-2 border-b-2",
    md: "h-8 w-8 border-t-3 border-b-3",
    lg: "h-12 w-12 border-t-4 border-b-4",
    xl: "h-16 w-16 border-t-4 border-b-4",
  };

  return (
    <div
      className={`flex justify-center items-center ${className}`}
      aria-label="Cargando"
    >
      <div
        className={`animate-spin rounded-full border-green-500 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default Spinner;
