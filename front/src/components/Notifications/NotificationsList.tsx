"use client";
import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../Context/UserContext";
import { BsFillBellFill, BsCheck, BsCheckCircleFill } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";

// URL del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://futbolink.onrender.com';

interface NotificationMetadata {
  jobId?: string;
  jobTitle?: string;
  applicationId?: string;
}

interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  metadata?: NotificationMetadata;
  sourceUser?: {
    id: string;
    name: string;
    lastname: string;
    imgUrl?: string;
  };
}

export const NotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useContext(UserContext);

  // Función para obtener las notificaciones del usuario
  const fetchNotifications = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/notifications/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para marcar una notificación como leída
  const markAsRead = async (id: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Actualizar el estado local
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  // Función para marcar todas las notificaciones como leídas
  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/notifications/read/all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Actualizar el estado local
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error al marcar todas como leídas:", error);
    }
  };

  // Formatear fecha relativa
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `Hace ${diffInSeconds} segundos`;
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return date.toLocaleDateString();
  };

  // Renderizar contenido adicional según el tipo de notificación
  const renderNotificationContent = (notification: Notification) => {
    if (notification.type === 'APPLICATION_SHORTLISTED' && notification.metadata?.jobId && notification.metadata?.jobTitle) {
      return (
        <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200">
          <div className="flex items-center text-green-800 mb-1">
            <BsCheckCircleFill className="mr-1" />
            <span className="text-xs font-medium">Seleccionado para evaluación</span>
          </div>
          <p className="text-xs text-gray-700">
            Oferta: <span className="font-medium">{notification.metadata.jobTitle}</span>
          </p>
          <Link 
            href={`/jobs/${notification.metadata.jobId}`}
            className="text-xs text-green-800 hover:underline mt-1 inline-block"
            onClick={() => markAsRead(notification.id)}
          >
            Ver oferta
          </Link>
        </div>
      );
    }
    return null;
  };

  // Cargar notificaciones al montar el componente y cuando cambie el token
  useEffect(() => {
    if (token) {
      fetchNotifications();
      
      // Actualizar notificaciones cada minuto
      const intervalId = setInterval(fetchNotifications, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [token]);

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.notifications-container')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="notifications-container relative">
      <button 
        className="relative p-2 text-gray-700 hover:text-green-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <BsFillBellFill className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Notificaciones</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-green-800 hover:text-green-600"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-800 mx-auto"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-green-50' : ''}`}
                >
                  <div className="flex items-start">
                    <div className="mr-3">
                      {notification.sourceUser?.imgUrl ? (
                        <Image 
                          src={notification.sourceUser.imgUrl} 
                          alt={`${notification.sourceUser.name} ${notification.sourceUser.lastname}`}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {notification.sourceUser?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(notification.createdAt)}</p>
                      {renderNotificationContent(notification)}
                    </div>
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="ml-2 text-green-800 hover:text-green-600"
                        title="Marcar como leída"
                      >
                        <BsCheck className="text-xl" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No tienes notificaciones
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsList; 