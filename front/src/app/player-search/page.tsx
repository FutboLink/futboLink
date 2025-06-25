"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { TranslationProvider } from '@/components/Context/TranslationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importar el componente de forma dinámica para evitar problemas de SSR
const PlayerSearch = dynamic(
  () => import('@/components/PlayerSearch/PlayerSearch'),
  { ssr: false }
);

export default function PlayerSearchPage() {
  return (
    <TranslationProvider>
      <ToastContainer />
      <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
        <PlayerSearch />
      </Suspense>
    </TranslationProvider>
  );
} 