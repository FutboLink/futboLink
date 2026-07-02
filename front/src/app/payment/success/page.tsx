"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { UserContext } from "@/components/Context/UserContext";
import { useContext } from "react";
import {
  updateUserSubscription,
  clearSubscriptionCache,
} from "@/services/SubscriptionService";


// Componente que usa useSearchParams (debe estar dentro de Suspense)
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id") || ""; // Stripe session ID from redirect URL
  const type = searchParams?.get("type") || ""; // Tipo de suscripción (verification, etc.)
  const redirect = searchParams?.get("redirect") || ""; // URL de redirección
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Procesando pago...");
  const [subscriptionType, setSubscriptionType] = useState("");
  const router = useRouter();
  const userContext = useContext(UserContext);
  const userEmail = userContext?.user?.email; // Acceder al email de manera segura
  const userRole = userContext?.role; // Get the user role
  const token = userContext?.token; // JWT bearer token for authenticated requests
  const refreshUserData = userContext?.refreshUserData; // Get refresh function

  // Determine the correct profile path based on role
  const getProfilePath = () => {
    if (!userRole) return "/";

    if (userRole === "PLAYER") return "/PanelUsers/Player";
    if (userRole === "RECRUITER" || userRole === "AGENCY" || userRole === "CLUB") return "/PanelUsers/Manager";
    if (userRole === "ADMIN") return "/PanelAdmin";

    return "/PanelUsers/Manager";
  };

  useEffect(() => {
    const processPayment = async () => {
      // Si es una suscripción de verificación, redirigir a la página específica
      if (type === "verification") {
        router.push("/verification-success");
        return;
      }

      // Verificar que tenemos el session_id de Stripe
      if (!sessionId) {
        setStatus("error");
        setMessage(
          "No se encontró el identificador de sesión de pago. Por favor, contacta a soporte."
        );
        return;
      }

      // Verificar que tenemos el email y token del usuario autenticado
      if (!userEmail || !token) {
        setStatus("error");
        setMessage(
          "No se pudo identificar al usuario. Por favor, inicia sesión nuevamente."
        );
        return;
      }

      try {
        // Activar la suscripción enviando session_id al backend (validación server-side)
        const result = await updateUserSubscription(sessionId, token, userEmail);

        if (result.success) {
          // Limpiar caché de suscripción para forzar una recarga
          clearSubscriptionCache();

          // Refrescar los datos del usuario en el contexto
          if (refreshUserData) {
            try {
              await refreshUserData();
              console.log("User context refreshed after successful payment");
            } catch (error) {
              console.error("Error refreshing user context:", error);
            }
          }

          const activatedPlan = result.subscriptionInfo?.subscriptionType || "Suscripción";
          setSubscriptionType(activatedPlan);

          // Disparar evento personalizado para notificar a otros componentes
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent('subscriptionUpdated', {
              detail: { subscriptionType: activatedPlan, isActive: true }
            }));
            console.log("Subscription update event dispatched");
          }

          setStatus("success");
          setMessage(
            `¡Tu suscripción al plan ${activatedPlan} ha sido activada correctamente!`
          );
        } else {
          setStatus("error");
          setMessage(`Error al activar la suscripción: ${result.message}`);
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        setStatus("error");
        setMessage(
          "Ocurrió un error al procesar el pago. Por favor, contacta a soporte."
        );
      }
    };

    processPayment();
  }, [sessionId, type, userEmail, token, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Procesando tu pago
            </h2>
            <p className="text-gray-500 text-center">
              Estamos verificando tu pago, por favor espera un momento...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ¡Pago exitoso!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">
                Detalles de tu plan
              </h3>
              <p className="text-green-700">
                <span className="font-medium">Plan:</span> {subscriptionType}
              </p>
              <p className="text-green-700 mt-1">
                <span className="font-medium">Estado:</span> Activo
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <Link
                href={getProfilePath()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Ir a mi perfil
              </Link>
              <Link
                href="/"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <svg
                  className="h-12 w-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Ha ocurrido un problema
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col space-y-3">
              <Link
                href="/Subs"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Intentar nuevamente
              </Link>
              <Link
                href="/"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de carga mientras Suspense está activo
function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Cargando...
          </h2>
          <p className="text-gray-500 text-center">
            Espera un momento mientras procesamos tu solicitud...
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente principal que envuelve con Suspense
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
