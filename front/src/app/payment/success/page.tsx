"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Optionally fetch payment details if needed
      fetch(`http://localhost:3000/payments/session/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setPaymentDetails(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [searchParams]);
  
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
              <Link href="/profile" className="inline-block rounded-md border border-transparent bg-verde-claro py-2 px-4 text-base font-medium text-white hover:bg-verde-oscuro">
                Ir a mi perfil
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 