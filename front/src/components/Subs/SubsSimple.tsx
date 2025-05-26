"use client";

import React, { useState, useContext, useEffect } from 'react';
import Link from 'next/link';
import styles from "../../Styles/cardSub.module.css";
import { UserContext } from "../Context/UserContext";
import { useRouter } from 'next/navigation';

// Simple subscription component without any external dependencies
export default function SubsSimple() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { user, isLogged } = useContext(UserContext);
  const router = useRouter();
  
  // API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Add effect to log user details
  useEffect(() => {
    if (user) {
      console.log("User context data:", user);
      const email = user.email || 'not available';
      setDebugInfo(`User found, email: ${email}`);
      
      // Store email in localStorage for testing
      if (email && email !== 'not available') {
        localStorage.setItem('userEmail', email);
        console.log('Stored userEmail in localStorage:', email);
      }
    } else {
      console.log("No user in context");
      setDebugInfo("No user found in context");
      
      // Check localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log("User from localStorage:", userData);
          
          // Also store email separately in localStorage for testing
          if (userData.email) {
            localStorage.setItem('userEmail', userData.email);
            console.log('Stored userEmail from localStorage.user:', userData.email);
          }
          
          setDebugInfo(prev => `${prev}, localStorage: ${userData.email || 'no email'}`);
        } catch (error) {
          console.error('Failed to parse localStorage data:', error);
        }
      } else {
        setDebugInfo(prev => `${prev}, No user in localStorage`);
      }
    }
  }, [user]);
  
  const handleSubscribe = async () => {
    // Verificar si el usuario está autenticado
    if (!isLogged || !user) {
      // Si no está autenticado, redirigir al login
      console.log("Usuario no autenticado. Redirigiendo al login...");
      router.push("/Login");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Primero usamos el email del contexto de usuario
      let userEmail: string | null = user.email || null;
      
      // Si no está disponible, buscamos en localStorage
      if (!userEmail) {
        userEmail = localStorage.getItem('userEmail');
      }
      
      // Si todavía no hay email, verificamos el objeto de usuario en localStorage
      if (!userEmail) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            userEmail = userData.email || null;
            console.log("Found email in localStorage:", userEmail);
          } catch (error) {
            console.error('Failed to parse user data from localStorage:', error);
            setError('Error parsing localStorage data. Please try logging in again.');
            router.push("/Login");
            return;
          }
        }
      }
      
      // Si aún no hay email, redirigir al login
      if (!userEmail) {
        setError('No user email found. Please log in again before subscribing.');
        console.error("No se pudo obtener el email del usuario");
        alert("Error: No se pudo obtener el email del usuario. Por favor, inicia sesión nuevamente.");
        router.push("/Login");
        return;
      }
      
      // Tipo de plan
      const planName = 'Profesional';
      
      // URL de éxito con el parámetro del plan
      const successUrl = `${window.location.origin}/payment/success?plan=${planName}`;
      
      console.log('Creating subscription with email:', userEmail);
      setDebugInfo(`Using email: ${userEmail}`);
      
      // Create the fetch request with minimal data
      const response = await fetch(`${apiUrl}/payments/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: userEmail,
          priceId: 'price_1R7MaqGbCHvHfqXFimcCzvlo',
          productId: 'prod_S1PP1zfIAIwheC',
          description: 'FutboLink Premium Subscription',
          successUrl: successUrl, // URL modificada con el parámetro del plan
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      });
      
      // Check for error status
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      
      // Get the response data
      const data = await response.json();
      console.log('Response data:', data);
      
      // Redirect to the checkout URL
      if (data.url) {
        console.log('Redirecting to:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL in response');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Premium Subscription</h1>
      
      <div className="mb-6 text-center">
        <p className="text-lg font-semibold">€7.95/month</p>
        <p className="text-gray-600">Access to all premium features</p>
      </div>
      
      {debugInfo && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md">
          <p className="font-bold">Debug Info:</p>
          <p>{debugInfo}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex justify-center">
        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className={`${styles.button} px-6 py-2 rounded-md transition duration-200 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Procesando...' : 'Suscribirme Ahora'}
        </button>
      </div>
      
      <div className="mt-4 text-center">
        <Link href="/subs" className="text-sm text-blue-600 hover:underline">
          Volver a planes
        </Link>
      </div>
    </div>
  );
} 