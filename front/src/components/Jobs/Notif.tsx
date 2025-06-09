import React, { useEffect, useState } from "react";

export const Notifi: React.FC<{ message: string }> = ({ message }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    // Auto-hide the notification after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-5 right-5 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 flex items-center animate-fadeIn">
      <div className="mr-3">
        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p className="font-medium">{message}</p>
      </div>
      <button 
        onClick={() => setVisible(false)}
        className="ml-4 text-green-500 hover:text-green-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
  