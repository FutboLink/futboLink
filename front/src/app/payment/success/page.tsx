"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { refreshUserSubscription, clearSubscriptionCache, manuallyActivateSubscription } from '@/services/SubscriptionService';
import { UserContext } from '@/components/Context/UserContext';
import { useContext } from 'react';

// Create a client component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [activatingSubscription, setActivatingSubscription] = useState(false);
  const [activationMessage, setActivationMessage] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Get user data from context
  const { user } = useContext(UserContext);
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    // Automatically activate subscription as soon as the component mounts
    const activateSubscription = () => {
      // Try to get user email from multiple sources
      let userEmail = null;
      
      // First, try to get the email from the user context
      if (user && user.email) {
        userEmail = user.email;
      } else {
        // If not in context, try localStorage
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
          userEmail = storedEmail;
        } else {
          // Try to get from stored user object
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              if (userData.email) {
                userEmail = userData.email;
              }
            } catch (e) {
              console.error('Error parsing user data from localStorage:', e);
            }
          }
        }
      }
      
      // If we found a user email, activate the subscription
      if (userEmail) {
        console.log('Automatically activating subscription for:', userEmail);
        manuallyActivateSubscriptionStatus(userEmail);
      } else {
        console.error('No user email found for subscription activation');
        setActivationMessage("Error: No se pudo identificar el usuario para activar la suscripción");
        setLoading(false);
      }
    };
    
    if (sessionId) {
      // Fetch payment details
      fetch(`${apiUrl}/payments/session/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setPaymentDetails(data);
          
          // If payment details contain email, use it to activate subscription
          if (data.customerEmail) {
            manuallyActivateSubscriptionStatus(data.customerEmail);
          } else {
            // Otherwise try from other sources
            activateSubscription();
          }
        })
        .catch((error) => {
          console.error('Error fetching payment details:', error);
          // Even if we can't fetch payment details, try to activate subscription
          activateSubscription();
        });
    } else {
      // No session ID, but still try to activate based on stored user info
      activateSubscription();
    }
  }, [searchParams, apiUrl, user]);
  
  const manuallyActivateSubscriptionStatus = async (email: string) => {
    try {
      setActivatingSubscription(true);
      setActivationMessage("Activando tu suscripción...");
      console.log('Manually activating subscription for:', email);
      
      // Store email in localStorage for reference
      localStorage.setItem('userEmail', email);
      
      // Directly activate the subscription in the database
      const result = await manuallyActivateSubscription(email);
      console.log('Subscription activation result:', result);
      
      if (result.success) {
        setActivationMessage("¡Suscripción activada con éxito!");
        
        // Store subscription info in localStorage for immediate use
        if (result.subscriptionInfo) {
          localStorage.setItem('subscriptionInfo', JSON.stringify(result.subscriptionInfo));
        }
        
        // Clear any pending subscription status
        localStorage.removeItem('pendingSubscriptionType');
      } else {
        setActivationMessage(`Error: ${result.message}`);
        
        // Fallback to normal refresh if manual activation fails
        console.log('Falling back to normal refresh...');
        await refreshSubscriptionStatus(email);
      }
      
      setLoading(false);
      setActivatingSubscription(false);
    } catch (error) {
      console.error('Error activating subscription:', error);
      setActivationMessage("Error al activar. Intentando método alternativo...");
      
      // Try normal refresh as fallback
      await refreshSubscriptionStatus(email);
      setLoading(false);
      setActivatingSubscription(false);
    }
  };
  
  const refreshSubscriptionStatus = async (email: string) => {
    try {
      setActivatingSubscription(true);
      console.log('Refreshing subscription status for:', email);
      
      // Clear cache first
      clearSubscriptionCache();
      
      // Refresh subscription status
      const result = await refreshUserSubscription(email);
      console.log('Subscription status refreshed:', result);
      
      // Store updated subscription info in localStorage for immediate use
      localStorage.setItem('subscriptionInfo', JSON.stringify(result));
      
      setActivatingSubscription(false);
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
      setActivatingSubscription(false);
    }
  };
  
  const handleGoToProfile = () => {
    // Force a reload of the profile page to ensure it shows updated subscription status
    router.push('/profile');
  };
  
  return (
    <div className="w-full max-w-md space-y-8 text-center">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-verde-oscuro">
          ¡Pago completado con éxito!
        </h2>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-oscuro mb-4"></div>
          <p className="text-sm text-gray-600">{activationMessage || 'Procesando tu suscripción...'}</p>
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
            {activatingSubscription ? (
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-verde-oscuro mr-2"></div>
                <span className="text-sm text-gray-600">{activationMessage || 'Activando tu suscripción...'}</span>
              </div>
            ) : (
              <>
                {activationMessage && (
                  <p className="text-sm text-green-600 mb-4">{activationMessage}</p>
                )}
                <button 
                  onClick={handleGoToProfile}
                  className="inline-block rounded-md border border-transparent bg-verde-claro py-2 px-4 text-base font-medium text-white hover:bg-verde-oscuro"
                >
                  Ir a mi perfil
                </button>
              </>
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