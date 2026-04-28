"use client";

import { useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/components/Context/UserContext';

export default function PlayerPanel() {
  const router = useRouter();
  const { user, isLogged } = useContext(UserContext);

  useEffect(() => {
    if (isLogged && user && user.id) {
      router.push(`/user/${user.id}`);
      return;
    }
    if (!isLogged) {
      // Evita el redirect prematuro mientras UserContext hidrata desde localStorage.
      if (
        typeof window !== "undefined" &&
        window.localStorage.getItem("user")
      ) {
        return;
      }
      router.push('/Login');
    }
  }, [isLogged, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo a tu perfil...</p>
      </div>
    </div>
  );
}
