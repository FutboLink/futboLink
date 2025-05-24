"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { activateUserSubscription, clearSubscriptionCache } from '@/services/SubscriptionService';
import { getSubscriptionName } from '@/helpers/helpersSubs';

// Create a client component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [activatingSubscription, setActivatingSubscription] = useState(false);
  const [activationMessage, setActivationMessage] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<boolean>(false);
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
          
          // After getting payment details, activate subscription hardcoded
          if (data.customerEmail && data.stripePriceId) {
            activateSubscriptionHardcoded(data.customerEmail, data.stripePriceId, sessionId);
          } else {
            // Try to get email from localStorage if not in payment details
            const userEmail = localStorage.getItem('userEmail');
            const storedUser = localStorage.getItem('user');
            
            let email = userEmail;
            if (!email && storedUser) {
              try {
                const userData = JSON.parse(storedUser);
                email = userData.email;
              } catch (e) {
                console.error('Error parsing user data from localStorage:', e);
              }
            }
            
            if (email && data.stripePriceId) {
              activateSubscriptionHardcoded(email, data.stripePriceId, sessionId);
            } else {
              setActivationMessage("No se pudo determinar el email del usuario o el tipo de suscripción.");
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching payment details:', error);
          setLoading(false);
          setActivationMessage("Error al obtener los detalles del pago.");
        });
    } else {
      setLoading(false);
      setActivationMessage("No se encontró ID de sesión de pago.");
    }
  }, [searchParams, apiUrl]);
  
  const activateSubscriptionHardcoded = async (email: string, priceId: string, sessionId: string) => {
    try {
      setActivatingSubscription(true);
      setActivationMessage("Activando tu suscripción...");
      console.log('Activating subscription hardcoded for:', email, 'with priceId:', priceId);
      
      // Determine subscription type from price ID
      const subscriptionType = getSubscriptionName(priceId);
      console.log('Determined subscription type:', subscriptionType);
      
      // Activate subscription using hardcoded method
      const result = await activateUserSubscription(email, subscriptionType, sessionId);
      console.log('Subscription activation result:', result);
      
      if (result.success) {
        setActivationMessage(`¡Suscripción ${subscriptionType} activada con éxito!`);
        setActivationSuccess(true);
      } else {
        setActivationMessage(`Error: ${result.message}`);
        setActivationSuccess(false);
      }
      
      setActivatingSubscription(false);
    } catch (error) {
      console.error('Error activating subscription:', error);
      setActivationMessage("Error al activar la suscripción. Por favor, contacta con soporte.");
      setActivationSuccess(false);
      setActivatingSubscription(false);
    }
  };
  
  const handleGoToProfile = () => {
    // Force a reload of the profile page to ensure it shows updated subscription status
    router.push('/PanelUsers/Player');
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
                  <p className={`text-sm mb-4 ${activationSuccess ? 'text-green-600' : 'text-red-600'}`}>
                    {activationMessage}
                  </p>
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