"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { refreshUserSubscription, clearSubscriptionCache } from '@/services/SubscriptionService';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const apiUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001' 
    : process.env.NEXT_PUBLIC_API_URL || 'https://futbolink.onrender.com';
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const email = searchParams.get('email') || '';
    const plan = searchParams.get('plan') || '';
    
    // Si estamos en modo desarrollo y no hay sessionId, usar datos simulados
    if (process.env.NODE_ENV === 'development' && !sessionId) {
      addDebugInfo('Modo desarrollo detectado, usando datos simulados');
      const simulatedData = {
        hasActiveSubscription: true,
        subscriptionType: plan || 'Semiprofesional'
      };
      localStorage.setItem('subscriptionInfo', JSON.stringify(simulatedData));
      addDebugInfo(`Datos simulados guardados: ${JSON.stringify(simulatedData)}`);
      setSuccess(true);
      setLoading(false);
      return;
    }
    
    if (!sessionId) {
      setLoading(false);
      setError('No se encontró ID de sesión');
      return;
    }
    
    // Añadir a la información de debug
    addDebugInfo(`Procesando sesión: ${sessionId}`);
    if (email) addDebugInfo(`Email: ${email}`);
    if (plan) addDebugInfo(`Plan: ${plan}`);
    
    // En desarrollo, podemos simular una verificación exitosa
    if (process.env.NODE_ENV === 'development') {
      addDebugInfo('Modo desarrollo: simulando verificación exitosa');
      const simulatedData = {
        hasActiveSubscription: true,
        subscriptionType: plan || 'Semiprofesional'
      };
      localStorage.setItem('subscriptionInfo', JSON.stringify(simulatedData));
      addDebugInfo(`Datos simulados guardados: ${JSON.stringify(simulatedData)}`);
      setSuccess(true);
      setLoading(false);
      return;
    }
    
    // Verificar y actualizar el estado de la suscripción
    const updateSubscription = async () => {
      try {
        // 1. Verificar el estado de la sesión y actualizar la suscripción
        addDebugInfo('Verificando estado de sesión en servidor...');
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
          throw new Error(`Error al verificar sesión: ${verifyResponse.status}`);
        }
        
        const verifyResult = await verifyResponse.json();
        addDebugInfo(`Respuesta del servidor: ${JSON.stringify(verifyResult)}`);
        
        // Esperar un momento para que se complete la actualización en la base de datos
        addDebugInfo('Esperando para asegurar que los cambios se completen...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 2. Limpiar caché de suscripción
        addDebugInfo('Limpiando caché de suscripción...');
        clearSubscriptionCache();
        
        // 3. Crear los datos de suscripción basados en la verificación exitosa
        // Este es un enfoque más fiable que intentar hacer otra llamada a la API
        if (verifyResult.success && verifyResult.subscriptionStatus === 'active') {
          addDebugInfo('Verificación exitosa, creando estado de suscripción');
          const subscriptionData = {
            hasActiveSubscription: true,
            subscriptionType: plan || 'Semiprofesional'
          };
          localStorage.setItem('subscriptionInfo', JSON.stringify(subscriptionData));
          addDebugInfo(`Datos de suscripción guardados: ${JSON.stringify(subscriptionData)}`);
          setSuccess(true);
          setLoading(false);
          return;
        }
        
        // Si la verificación no fue exitosa, intentar actualizar con API
        if (email) {
          addDebugInfo(`Actualizando información de suscripción para: ${email}`);
          try {
            const result = await refreshUserSubscription(email);
            addDebugInfo(`Resultado de actualización: ${JSON.stringify(result)}`);
            localStorage.setItem('subscriptionInfo', JSON.stringify(result));
          } catch (error) {
            addDebugInfo(`Error al actualizar suscripción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            // Usar datos basados en la verificación como fallback
            if (verifyResult.success) {
              const fallbackData = {
                hasActiveSubscription: true,
                subscriptionType: plan || 'Semiprofesional'
              };
              localStorage.setItem('subscriptionInfo', JSON.stringify(fallbackData));
              addDebugInfo(`Usando datos fallback: ${JSON.stringify(fallbackData)}`);
            }
          }
        }
        
        setSuccess(true);
        setLoading(false);
      } catch (error) {
        console.error('Error updating subscription:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
        addDebugInfo(`ERROR: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        
        // En caso de error, pero estamos en desarrollo, crear datos simulados
        if (process.env.NODE_ENV === 'development') {
          const fallbackData = {
            hasActiveSubscription: true,
            subscriptionType: plan || 'Semiprofesional'
          };
          localStorage.setItem('subscriptionInfo', JSON.stringify(fallbackData));
          addDebugInfo(`Datos simulados de emergencia: ${JSON.stringify(fallbackData)}`);
          setSuccess(true);
        }
        
        setLoading(false);
      }
    };
    
    updateSubscription();
  }, [searchParams, apiUrl, router]);
  
  // Función auxiliar para añadir información de depuración
  const addDebugInfo = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, message]);
  };
  
  const handleGoToProfile = () => {
    // Asegurarnos de que se recarga la página al ir al perfil
    window.location.href = '/profile';
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-verde-oscuro">
            {loading ? 'Procesando tu pago...' : success ? '¡Pago completado con éxito!' : 'Error al procesar el pago'}
          </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-verde-oscuro"></div>
          </div>
        ) : (
          <div className="bg-gray-50 px-4 py-5 sm:px-6 rounded-lg shadow">
            {success ? (
              <p className="text-lg text-gray-700 mb-4">
                Gracias por tu suscripción a futboLink. Tu cuenta ha sido actualizada.
              </p>
            ) : (
              <p className="text-lg text-red-600 mb-4">
                {error || 'Hubo un problema al procesar tu pago. Por favor, contacta a soporte.'}
              </p>
            )}
            
            <div className="mt-6">
              <button 
                onClick={handleGoToProfile}
                className="inline-block rounded-md border border-transparent bg-verde-claro py-2 px-4 text-base font-medium text-white hover:bg-verde-oscuro"
              >
                Ir a mi perfil
              </button>
            </div>
          </div>
        )}
        
        {/* Solo mostrar información de depuración en desarrollo */}
        {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-xs overflow-auto max-h-60">
            <h3 className="font-bold mb-2">Información de depuración:</h3>
            <ul className="space-y-1">
              {debugInfo.map((info, index) => (
                <li key={index} className="text-gray-700">{info}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 