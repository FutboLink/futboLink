import React from "react";

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[500px] p-4 rounded-md shadow-lg z-50 bg-[#4e6d43] text-white border-2 border-[#3e7c27] hover:bg-gray-100 hover:text-[#26441b] transition">
    <div className="flex items-center justify-between">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-xl bg-transparent text-white hover:text-gray-800">
        &times;
      </button>
    </div>
  </div>
  
  );
};

export default Notification;
