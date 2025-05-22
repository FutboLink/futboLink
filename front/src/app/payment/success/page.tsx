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
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [retryCount, setRetryCount] = useState(0);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Function to fetch payment details
  const fetchPaymentDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`${apiUrl}/payments/session/${sessionId}`);
      if (!response.ok) {
        throw new Error(`Error fetching payment details: ${response.status}`);
      }
      const data = await response.json();
      setPaymentDetails(data);
      return data;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return null;
    }
  };
  
  // Function to force update subscription status
  const forceUpdateSubscription = async (email: string, sessionId: string) => {
    try {
      console.log('Force updating subscription for:', email);
      setRefreshingSubscription(true);
      
      // First, manually trigger the session verification on the server side
      const verifyResponse = await fetch(`${apiUrl}/payments/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId,
          email 
        }),
      });
      
      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.text();
        console.warn('Session verification warning:', errorData);
        // Continue anyway - this is just an extra precaution
      } else {
        const verifyData = await verifyResponse.json();
        console.log('Session verification result:', verifyData);
      }
      
      // Wait a moment to allow server processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear cache first
      clearSubscriptionCache();
      
      // Refresh subscription status
      const result = await refreshUserSubscription(email);
      console.log('Subscription status refreshed:', result);
      
      // Store updated subscription info in localStorage for immediate use
      localStorage.setItem('subscriptionInfo', JSON.stringify(result));
      
      setRefreshingSubscription(false);
      return result;
    } catch (error) {
      console.error('Error force updating subscription:', error);
      setRefreshingSubscription(false);
      return null;
    }
  };
  
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
      setVerificationStatus('error');
    }
  };
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const email = searchParams.get('email') || '';
    const plan = searchParams.get('plan') || '';
    
    if (!sessionId) {
      setLoading(false);
      setVerificationStatus('error');
      return;
    }
    
    // First time fetch
    fetchPaymentDetails(sessionId).then(data => {
      setLoading(false);
      
      if (!data) {
        setVerificationStatus('error');
        return;
      }
      
      // Verify payment status before updating subscription
      if (data.status === 'succeeded') {
        setVerificationStatus('success');
        
        // Use email from URL params first, then from payment details
        const userEmail = email || data.customerEmail;
        if (userEmail) {
          // Use force update instead of simple refresh
          forceUpdateSubscription(userEmail, sessionId);
        } else {
          // Fallback to localStorage if no email found
          const storedEmail = localStorage.getItem('userEmail');
          const storedUser = localStorage.getItem('user');
          
          if (storedEmail) {
            forceUpdateSubscription(storedEmail, sessionId);
          } else if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              if (userData.email) {
                forceUpdateSubscription(userData.email, sessionId);
              }
            } catch (e) {
              console.error('Error parsing user data from localStorage:', e);
              setVerificationStatus('error');
            }
          } else {
            setVerificationStatus('error');
          }
        }
      } else {
        // Payment not succeeded yet - set up polling for status updates
        setVerificationStatus('pending');
        console.log('Payment status not succeeded yet:', data.status);
      }
    });
    
    // Set up polling if needed (every 5 seconds, up to 6 times = 30 seconds total)
    const maxRetries = 6;
    const retryInterval = 5000;
    
    // Only set up polling if we have a sessionId
    if (sessionId) {
      const intervalId = setInterval(() => {
        // Check if we should stop polling
        if (retryCount >= maxRetries || verificationStatus === 'success') {
          clearInterval(intervalId);
          return;
        }
        
        setRetryCount(count => count + 1);
        console.log(`Checking payment status, attempt ${retryCount + 1} of ${maxRetries}`);
        
        // Fetch payment details again
        fetchPaymentDetails(sessionId).then(data => {
          if (!data) return;
          
          setPaymentDetails(data);
          
          // If payment succeeded, update subscription
          if (data.status === 'succeeded') {
            setVerificationStatus('success');
            clearInterval(intervalId);
            
            // Use email from URL params first, then from payment details
            const userEmail = email || data.customerEmail;
            if (userEmail) {
              forceUpdateSubscription(userEmail, sessionId);
            }
          }
        });
      }, retryInterval);
      
      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [searchParams, apiUrl, retryCount, verificationStatus]);
  
  const handleGoToProfile = () => {
    // Force a reload of the profile page to ensure it shows updated subscription status
    router.push('/profile');
  };
  
  const handleManualUpdate = () => {
    const sessionId = searchParams.get('session_id');
    const email = searchParams.get('email') || '';
    
    if (!sessionId) {
      alert('No se encontró el ID de sesión');
      return;
    }
    
    if (!email) {
      // Try to get email from payment details or localStorage
      const storedEmail = localStorage.getItem('userEmail');
      const storedUser = localStorage.getItem('user');
      
      if (paymentDetails?.customerEmail) {
        forceUpdateSubscription(paymentDetails.customerEmail, sessionId);
      } else if (storedEmail) {
        forceUpdateSubscription(storedEmail, sessionId);
      } else if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.email) {
            forceUpdateSubscription(userData.email, sessionId);
          } else {
            alert('No se pudo encontrar tu email. Por favor, contacta a soporte.');
          }
        } catch (e) {
          alert('Error al leer los datos de usuario. Por favor, contacta a soporte.');
        }
      } else {
        alert('No se pudo encontrar tu email. Por favor, contacta a soporte.');
      }
    } else {
      forceUpdateSubscription(email, sessionId);
    }
  };
  
  return (
    <div className="w-full max-w-md space-y-8 text-center">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-verde-oscuro">
          {verificationStatus === 'success' 
            ? '¡Pago completado con éxito!' 
            : 'Procesando tu pago...'}
        </h2>
      </div>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-oscuro"></div>
        </div>
      ) : (
        <div className="bg-gray-50 px-4 py-5 sm:px-6 rounded-lg shadow">
          {verificationStatus === 'success' ? (
            <p className="text-lg text-gray-700 mb-4">
              Gracias por tu suscripción a futboLink. Tu cuenta ha sido actualizada.
            </p>
          ) : verificationStatus === 'pending' ? (
            <p className="text-lg text-gray-700 mb-4">
              Estamos procesando tu pago. Por favor, espera unos momentos mientras confirmamos tu transacción.
              {retryCount > 0 && ` (Intento ${retryCount} de 6)`}
            </p>
          ) : (
            <p className="text-lg text-gray-700 mb-4">
              No pudimos confirmar el estado de tu pago. Tu cuenta se actualizará automáticamente cuando se complete la transacción.
            </p>
          )}
          
          {paymentDetails && (
            <div className="text-sm text-gray-600 mt-4 text-left">
              <p><strong>ID de transacción:</strong> {paymentDetails.id}</p>
              <p><strong>Monto:</strong> {paymentDetails.amountTotal} {paymentDetails.currency}</p>
              <p><strong>Estado:</strong> {paymentDetails.status}</p>
              <p><strong>Fecha:</strong> {new Date(paymentDetails.createdAt).toLocaleString()}</p>
              {verificationStatus === 'error' && (
                <p className="text-red-500 mt-2">
                  <strong>Aviso:</strong> No se pudo verificar el pago. Tu cuenta se actualizará automáticamente cuando se confirme el pago.
                </p>
              )}
            </div>
          )}
          
          <div className="mt-8">
            {refreshingSubscription ? (
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-verde-oscuro mr-2"></div>
                <span className="text-sm text-gray-600">Actualizando tu suscripción...</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleGoToProfile}
                  className="inline-block rounded-md border border-transparent bg-verde-claro py-2 px-4 text-base font-medium text-white hover:bg-verde-oscuro"
                >
                  Ir a mi perfil
                </button>
                
                {(verificationStatus === 'error' || !paymentDetails?.hasActiveSubscription) && (
                  <button 
                    onClick={handleManualUpdate}
                    className="inline-block rounded-md border border-verde-claro bg-white py-2 px-4 text-base font-medium text-verde-oscuro hover:bg-gray-50"
                  >
                    Actualizar suscripción manualmente
                  </button>
                )}
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