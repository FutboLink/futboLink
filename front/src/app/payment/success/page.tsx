"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { refreshUserSubscription, clearSubscriptionCache } from '@/services/SubscriptionService';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [refreshingSubscription, setRefreshingSubscription] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Fetch payment details
      fetch(`${apiUrl}/payments/session/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setPaymentDetails(data);
          setLoading(false);
          
          // After getting payment details, refresh subscription status
          if (data.customerEmail) {
            refreshSubscriptionStatus(data.customerEmail);
          } else {
            // Try to get email from localStorage if not in payment details
            const userEmail = localStorage.getItem('userEmail');
            const storedUser = localStorage.getItem('user');
            
            if (userEmail) {
              refreshSubscriptionStatus(userEmail);
            } else if (storedUser) {
              try {
                const userData = JSON.parse(storedUser);
                if (userData.email) {
                  refreshSubscriptionStatus(userData.email);
                }
              } catch (e) {
                console.error('Error parsing user data from localStorage:', e);
              }
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching payment details:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [searchParams, apiUrl]);
  
  const refreshSubscriptionStatus = async (email: string) => {
    try {
      setRefreshingSubscription(true);
      console.log('Refreshing subscription status for:', email);
      
      // Clear cache first
      clearSubscriptionCache();
      
      // Refresh subscription status
      const result = await refreshUserSubscription(email);
      console.log('Subscription status refreshed:', result);
      
      // Store updated subscription info in localStorage for immediate use
      localStorage.setItem('subscriptionInfo', JSON.stringify(result));
      
      setRefreshingSubscription(false);
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
      setRefreshingSubscription(false);
    }
  };
  
  const handleGoToProfile = () => {
    // Force a reload of the profile page to ensure it shows updated subscription status
    router.push('/profile');
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-verde-oscuro">
            ¡Pago completado con éxito!
          </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-oscuro"></div>
          </div>
        ) : (
          <div className="bg-gray-50 px-4 py-5 sm:px-6 rounded-lg shadow">
            <p className="text-lg text-gray-700 mb-4">
              Gracias por tu suscripción a futboLink. Tu cuenta ha sido actualizada.
            </p>
            
            {paymentDetails && (
              <div className="text-sm text-gray-600 mt-4 text-left">
                <p><strong>ID de transacción:</strong> {paymentDetails.id}</p>
                <p><strong>Monto:</strong> {paymentDetails.amountTotal} {paymentDetails.currency}</p>
                <p><strong>Estado:</strong> {paymentDetails.status}</p>
                <p><strong>Fecha:</strong> {new Date(paymentDetails.createdAt).toLocaleString()}</p>
              </div>
            )}
            
            <div className="mt-8">
              {refreshingSubscription ? (
                <div className="flex justify-center mb-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-verde-oscuro mr-2"></div>
                  <span className="text-sm text-gray-600">Actualizando tu suscripción...</span>
                </div>
              ) : (
                <button 
                  onClick={handleGoToProfile}
                  className="inline-block rounded-md border border-transparent bg-verde-claro py-2 px-4 text-base font-medium text-white hover:bg-verde-oscuro"
                >
                  Ir a mi perfil
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 