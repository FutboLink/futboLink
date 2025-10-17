"use client";

import React, { useEffect, useState, useContext } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Line from "../components/HorizontalDiv/line";
import styles from "../Styles/cardSub.module.css";
import Image from "next/image";
import Link from "next/link";
import { UserContext } from "../components/Context/UserContext";
import { useRouter } from "next/navigation";
import Head from "next/head";

// Plan único para verificación de perfil
const verificationPlan = {
  title: "Verificación de Perfil",
  slogan: "Destacá tu perfil con una insignia de verificado",
  image: "/icons-positions/portero.png",
  monthlyPrice: "$9.99",
  yearlyPrice: "$99.99",
  priceId: {
    monthly: "price_1S5Z3lGbCHvHfqXFd1Xkxf54",
    yearly: "price_1S5ZCrGbCHvHfqXFSySOSYdQ"
  },
  productId: "prod_verification_basic",
  features: [
    { text: "Insignia de verificado en tu perfil", available: true, highlight: true },
    { text: "Aparece primero en búsquedas", available: true },
    { text: "Mayor credibilidad ante reclutadores", available: true },
    { text: "Soporte por email", available: true },
    { text: "Verificación de documentos", available: true }
  ]
};

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function VerificationSubscription({ isOpen, onClose }: VerificationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { isLogged, user } = useContext(UserContext);
  const router = useRouter();

  // Estado de selección de plan
  const [selectedPlan, setSelectedPlan] = useState(verificationPlan.priceId.monthly);

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    
    // Verificar si el usuario está autenticado
    if (!isLogged || !user) {
      console.log("Usuario no autenticado. Redirigiendo al login...");
      router.push("/Login");
      return;
    }
    
    setIsLoading(true);

    try {
      // Obtener el email del usuario del contexto
      const userEmail = user.email || localStorage.getItem('userEmail');
      
      if (!userEmail) {
        console.error("No se pudo obtener el email del usuario");
        alert("Error: No se pudo obtener el email del usuario. Por favor, inicia sesión nuevamente.");
        router.push("/Login");
        return;
      }
      
      // Get the product ID if available
      const productId = verificationPlan.productId;
      const planName = verificationPlan.title;
      
      console.log(`Creating verification subscription with price ID: ${selectedPlan}`);
      console.log(`User email: ${userEmail}`);
      if (productId) {
        console.log(`Using product ID: ${productId}`);
      }
      console.log(`API URL: ${apiUrl}/payments/subscription`);
      
      // Crear la URL de éxito que incluye el parámetro del plan y redirige al perfil
      const successUrl = `${window.location.origin}/payment/success?plan=${encodeURIComponent(planName)}&type=verification&redirect=${encodeURIComponent(`/user-viewer/${user.id}`)}`;
      
      const response = await fetch(
        `${apiUrl}/payments/subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            priceId: selectedPlan,
            customerEmail: userEmail,
            successUrl: successUrl,
            cancelUrl: `${window.location.origin}/payment/cancel`,
            description: "Suscripción de Verificación de Perfil - FutboLink",
            ...(productId && { productId }),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        throw new Error(`Error HTTP: ${response.status}. ${errorData}`);
      }

      const data = await response.json();
      
      if (data.url) {
        console.log(`Redirecting to: ${data.url}`);
        window.location.href = data.url;
      } else {
        console.error("Response data:", data);
        throw new Error("No se recibió URL de pago");
      }
    } catch (error) {
      console.error("Error al crear la sesión de pago:", error);
      alert(`Error al procesar el pago: ${error instanceof Error ? error.message : 'Desconocido'}. Por favor, inténtelo de nuevo más tarde.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verificación de Perfil
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Destacá tu perfil con una insignia de verificado
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            type="button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Plan Card */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6 border border-blue-200">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Image
                  src={verificationPlan.image}
                  alt={verificationPlan.title}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {verificationPlan.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {verificationPlan.slogan}
              </p>
              
              {/* Features */}
              <div className="space-y-2 mb-6">
                {verificationPlan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecciona tu plan de verificación:
            </label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={verificationPlan.priceId.monthly}>
                Mensual - {verificationPlan.monthlyPrice}
              </option>
              <option value={verificationPlan.priceId.yearly}>
                Anual - {verificationPlan.yearlyPrice} (Ahorra 17%)
              </option>
            </select>
          </div>

          {/* Benefits Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 mb-2">¿Por qué verificar tu perfil?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Insignia de verificado visible en tu perfil</li>
              <li>• Mayor credibilidad ante reclutadores</li>
              <li>• Apareces primero en las búsquedas</li>
              <li>• Perfil más profesional y confiable</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              type="button"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Contratar Verificación
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationSubscription;
