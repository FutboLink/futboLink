"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { refreshUserSubscription, clearSubscriptionCache, manuallyActivateSubscription } from '@/services/SubscriptionService';

// Create a client component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [activatingSubscription, setActivatingSubscription] = useState(false);
  const [activationMessage, setActivationMessage] = useState<string | null>(null);
  const [activationComplete, setActivationComplete] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Función para activar manualmente la suscripción
  const manuallyActivateSubscriptionStatus = async (email: string) => {
    try {
      setActivatingSubscription(true);
      setActivationMessage("Activando tu suscripción...");
      console.log('Activando automáticamente la suscripción para:', email);
      
      // Directamente activar la suscripción en la base de datos
      const result = await manuallyActivateSubscription(email);
      console.log('Resultado de activación de suscripción:', result);
      
      if (result.success) {
        setActivationMessage("¡Suscripción activada con éxito!");
        setActivationComplete(true);
        
        // Redirigir automáticamente al perfil después de 3 segundos
        setTimeout(() => {
          router.push('/PanelUsers/Player');
        }, 3000);
      } else {
        setActivationMessage(`Error: ${result.message}`);
        
        // Intentar con el método alternativo si falla
        console.log('Intentando método alternativo...');
        await refreshSubscriptionStatus(email);
      }
      
      setActivatingSubscription(false);
    } catch (error) {
      console.error('Error activando suscripción:', error);
      setActivationMessage("Error al activar. Intentando método alternativo...");
      
      // Intentar con refresh normal como alternativa
      await refreshSubscriptionStatus(email);
      setActivatingSubscription(false);
    }
  };
  
  const refreshSubscriptionStatus = async (email: string) => {
    try {
      setActivatingSubscription(true);
      console.log('Actualizando estado de suscripción para:', email);
      
      // Limpiar caché primero
      clearSubscriptionCache();
      
      // Actualizar estado de suscripción
      const result = await refreshUserSubscription(email);
      console.log('Estado de suscripción actualizado:', result);
      
      // Guardar información actualizada en localStorage para uso inmediato
      localStorage.setItem('subscriptionInfo', JSON.stringify(result));
      
      setActivationComplete(true);
      setActivatingSubscription(false);
    } catch (error) {
      console.error('Error actualizando estado de suscripción:', error);
      setActivatingSubscription(false);
    }
  };

  // Efecto para procesar la activación de la suscripción automáticamente al cargar
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Obtener detalles del pago y activar suscripción
      fetch(`${apiUrl}/payments/session/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setPaymentDetails(data);
          
          // Guardar el tipo de suscripción pendiente para uso en caso de que la activación automática falle
          if (data.subscriptionType) {
            localStorage.setItem('pendingSubscriptionType', data.subscriptionType);
          }
          
          // Activar automáticamente la suscripción
          if (data.customerEmail) {
            manuallyActivateSubscriptionStatus(data.customerEmail);
          } else {
            // Intentar obtener email de localStorage si no está en los detalles del pago
            const userEmail = localStorage.getItem('userEmail');
            const storedUser = localStorage.getItem('user');
            
            if (userEmail) {
              manuallyActivateSubscriptionStatus(userEmail);
            } else if (storedUser) {
              try {
                const userData = JSON.parse(storedUser);
                if (userData.email) {
                  manuallyActivateSubscriptionStatus(userData.email);
                } else {
                  setActivationMessage("No se pudo encontrar tu email. Por favor, ve a tu perfil para activar manualmente.");
                  setLoading(false);
                }
              } catch (e) {
                console.error('Error analizando datos de usuario desde localStorage:', e);
                setLoading(false);
              }
            } else {
              setActivationMessage("No se pudo encontrar tu email. Por favor, ve a tu perfil para activar manualmente.");
              setLoading(false);
            }
          }
        })
        .catch((error) => {
          console.error('Error obteniendo detalles del pago:', error);
          setActivationMessage("Error al obtener detalles del pago. Por favor, ve a tu perfil para activar manualmente.");
          setLoading(false);
        });
    } else {
      setActivationMessage("No se encontró ID de sesión. Por favor, ve a tu perfil para activar manualmente.");
      setLoading(false);
    }
  }, [searchParams, apiUrl]);
  
  return (
    <div className="w-full max-w-md space-y-8 text-center">
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-verde-oscuro">
          ¡Pago completado con éxito!
        </h2>
      </div>
      
      <div className="bg-gray-50 px-4 py-5 sm:px-6 rounded-lg shadow">
        <p className="text-lg text-gray-700 mb-4">
          Gracias por tu suscripción a futboLink. Tu cuenta está siendo actualizada.
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
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-verde-oscuro mr-2"></div>
                <span className="text-md text-gray-600">{activationMessage || 'Activando tu suscripción...'}</span>
              </div>
              <p className="text-sm text-gray-500">Serás redirigido automáticamente a tu perfil en unos segundos...</p>
            </div>
          ) : (
            <>
              {activationMessage && (
                <p className={`text-md mb-4 ${activationComplete ? 'text-green-600' : 'text-red-600'}`}>
                  {activationMessage}
                </p>
              )}
              <button 
                onClick={() => router.push('/PanelUsers/Player')}
                className="inline-block rounded-md border border-transparent bg-verde-claro py-2 px-4 text-base font-medium text-white hover:bg-verde-oscuro"
              >
                Ir a mi perfil
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <Suspense fallback={
        <div className="w-full max-w-md space-y-8 text-center">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-verde-oscuro">
            Procesando tu pago...
          </h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-oscuro"></div>
          </div>
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
} 