'use client';
import { Toaster } from 'react-hot-toast';

export default function ToastContainer() {
  return (
    <Toaster 
      position="top-right" 
      toastOptions={{
        style: {
          background: '#ffffff',
          color: '#333333',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        success: {
          style: {
            background: '#f0fff4',
            border: '1px solid #c6f6d5',
          },
        },
        error: {
          style: {
            background: '#fff5f5',
            border: '1px solid #fed7d7',
          },
        },
        duration: 4000,
      }}
    />
  );
} 