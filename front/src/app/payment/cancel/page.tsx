"use client";

import React from 'react';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-red-600">
            Pago cancelado
          </h2>
        </div>
        
        <div className="bg-gray-50 px-4 py-5 sm:px-6 rounded-lg shadow">
          <p className="text-lg text-gray-700 mb-4">
            Has cancelado el proceso de pago. No se te ha cobrado.
          </p>
          
          <p className="text-sm text-gray-600 mb-8">
            Si has tenido algún problema durante el proceso de pago, por favor contacta con nuestro servicio de atención al cliente.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/Subs" className="inline-block rounded-md border border-transparent bg-verde-claro py-2 px-4 text-base font-medium text-white hover:bg-verde-oscuro">
              Volver a planes
            </Link>
            
            <Link href="/" className="inline-block rounded-md border border-gray-300 bg-white py-2 px-4 text-base font-medium text-gray-700 hover:bg-gray-50">
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 