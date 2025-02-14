// Notification.tsx
import React from 'react';

type NotificationProps = {
  message: string;
  type: 'success' | 'error';
};

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
  const backgroundColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  
  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md text-white ${backgroundColor}`}>
      {message}
    </div>
  );
};

export default Notification;
