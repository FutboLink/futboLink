"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { refreshUserSubscription, clearSubscriptionCache } from '@/services/SubscriptionService';

// Create a client component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [refreshingSubscription, setRefreshingSubscription] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('pending'); // 'pending', 'success', 'error'
  const [retryCount, setRetryCount] = useState<number>(0);
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
      
      // Implementar mecanismo de reintento para asegurar actualización de suscripción
      let attempts = 0;
      const maxAttempts = 5;
      let result = null;
      
      while (attempts < maxAttempts) {
        attempts++;
        setRetryCount(attempts);
        console.log(`Intento ${attempts} de ${maxAttempts} para actualizar suscripción...`);
        
        // Esperar un tiempo antes de cada intento (incrementando con cada reintento)
        if (attempts > 1) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
        }
        
        // Refresh subscription status
        result = await refreshUserSubscription(email);
        console.log('Resultado de actualización:', result);
        
        // Si la suscripción está activa, terminar los reintentos
        if (result.hasActiveSubscription) {
          console.log('¡Suscripción activa confirmada!');
          setSubscriptionStatus('success');
          break;
        }
        
        console.log('Suscripción aún no activa, reintentando...');
      }
      
      // Almacenar el resultado final, sea cual sea
      if (result) {
        console.log('Almacenando información de suscripción final:', result);
        localStorage.setItem('subscriptionInfo', JSON.stringify(result));
        
        // Si después de todos los intentos no se activó la suscripción, marcar como error
        if (!result.hasActiveSubscription && retryCount >= 5) {
          setSubscriptionStatus('error');
        }
      } else {
        setSubscriptionStatus('error');
      }
      
      setRefreshingSubscription(false);
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
      setRefreshingSubscription(false);
      setSubscriptionStatus('error');
    }
  };
  
  const handleGoToProfile = () => {
    // Force a reload of the profile page to ensure it shows updated subscription status
    router.push('/profile');
  };
  
  const handleManualRetry = async () => {
    // Get email from payment details or localStorage
    const email = paymentDetails?.customerEmail || 
                 localStorage.getItem('userEmail') || 
                 JSON.parse(localStorage.getItem('user') || '{}').email;
    
    if (email) {
      setSubscriptionStatus('pending');
      await refreshSubscriptionStatus(email);
    }
  };
  
  return (
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
            Gracias por tu suscripción a futboLink.
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
              <div className="flex flex-col items-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-verde-oscuro mb-2"></div>
                <span className="text-sm text-gray-600">
                  Actualizando tu suscripción... (Intento {retryCount} de 5)
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Este proceso puede tardar unos momentos mientras confirmamos tu pago.
                </p>
              </div>
            ) : subscriptionStatus === 'success' ? (
              <div className="flex flex-col items-center">
                <div className="bg-green-100 text-green-700 p-3 rounded-full mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-700 font-medium mb-4">¡Tu cuenta ha sido actualizada correctamente!</p>
                <button 
                  onClick={handleGoToProfile}
                  className="inline-block rounded-md border border-transparent bg-verde-claro py-2 px-4 text-base font-medium text-white hover:bg-verde-oscuro"
                >
                  Ir a mi perfil
                </button>
              </div>
            ) : subscriptionStatus === 'error' ? (
              <div className="flex flex-col items-center">
                <div className="bg-red-100 text-red-700 p-3 rounded-full mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-700 font-medium mb-2">No pudimos confirmar la actualización de tu suscripción.</p>
                <p className="text-sm text-gray-600 mb-4">Tu pago fue procesado correctamente, pero puede tomar unos minutos en reflejarse en tu cuenta.</p>
                <div className="flex space-x-4">
                  <button 
                    onClick={handleManualRetry}
                    className="inline-block rounded-md border border-verde-claro bg-white py-2 px-4 text-base font-medium text-verde-claro hover:bg-gray-50"
                  >
                    Reintentar
                  </button>
                  <button 
                    onClick={handleGoToProfile}
                    className="inline-block rounded-md border border-transparent bg-verde-claro py-2 px-4 text-base font-medium text-white hover:bg-verde-oscuro"
                  >
                    Ir a mi perfil
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-verde-oscuro mr-2"></div>
                <span className="text-sm text-gray-600">Verificando estado de tu suscripción...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Loading fallback component
function LoadingPayment() {
  return (
    <div className="w-full max-w-md space-y-8 text-center">
      <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-verde-oscuro">
        Cargando información de pago...
      </h2>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-oscuro"></div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <Suspense fallback={<LoadingPayment />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
} 