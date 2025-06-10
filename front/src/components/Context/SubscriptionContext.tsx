'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface SubscriptionContextType {
  updateSubscription: (userId: string, isProfesional: boolean) => Promise<any>;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const updateSubscription = async (userId: string, isProfesional: boolean) => {
    try {
      setIsLoading(true);
      
      // Show a loading toast
      const loadingToast = toast.loading(`Actualizando suscripción...`);
      
      // Calculate expiration date - 30 days from now if Profesional
      const subscriptionExpiresAt = isProfesional 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
        : null;
      
      // Fix: Use the correct API endpoint structure
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://futbolink.onrender.com';
      
      // Try different endpoint structures
      // Attempt with /users/ endpoint first (plural)
      let endpoint = `${API_URL}/users/update-subscription/${userId}`;
      console.log('Trying API endpoint:', endpoint);
      
      try {
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            subscriptionType: isProfesional ? 'Profesional' : 'Amateur',
            subscriptionExpiresAt
          }),
        });
        
        // If successful, use this result
        if (response.ok) {
          const data = await response.json();
          // Dismiss the loading toast
          toast.dismiss(loadingToast);
          toast.success(`Suscripción cambiada a ${isProfesional ? 'Profesional' : 'Amateur'}`);
          return data;
        }
        
        // If not successful, try the singular /user/ endpoint
        endpoint = `${API_URL}/user/${userId}/subscription`;
        console.log('Trying alternative API endpoint:', endpoint);
        
        const altResponse = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            subscriptionType: isProfesional ? 'Profesional' : 'Amateur',
            subscriptionExpiresAt
          }),
        });
        
        // Dismiss the loading toast
        toast.dismiss(loadingToast);
        
        if (!altResponse.ok) {
          const errorData = await altResponse.json();
          throw new Error(errorData.message || 'Error al actualizar la suscripción');
        }
        
        const altData = await altResponse.json();
        toast.success(`Suscripción cambiada a ${isProfesional ? 'Profesional' : 'Amateur'}`);
        return altData;
      } catch (error) {
        console.error('Error en primera alternativa:', error);
        
        // Try one more alternative
        endpoint = `${API_URL}/user/${userId}`;
        console.log('Trying final alternative API endpoint:', endpoint);
        
        const finalResponse = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            subscriptionType: isProfesional ? 'Profesional' : 'Amateur'
          }),
        });
        
        // Dismiss the loading toast
        toast.dismiss(loadingToast);
        
        if (!finalResponse.ok) {
          const errorData = await finalResponse.json();
          throw new Error(errorData.message || 'Error al actualizar la suscripción');
        }
        
        const finalData = await finalResponse.json();
        toast.success(`Suscripción cambiada a ${isProfesional ? 'Profesional' : 'Amateur'}`);
        return finalData;
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Error al actualizar la suscripción');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider value={{ updateSubscription, isLoading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 