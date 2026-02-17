"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { FaEnvelope, FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import Link from "next/link";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

function VerificationPendingContent() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState(false);

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    setResendMessage("");
    setResendError(false);

    try {
      const response = await fetch(`${apiUrl}/user/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage(data.message || "Email de verificación reenviado exitosamente.");
      } else {
        setResendError(true);
        setResendMessage(data.message || "Error al reenviar el email.");
      }
    } catch {
      setResendError(true);
      setResendMessage("Error al conectar con el servidor.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center border border-emerald-100">
        <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <FaEnvelope className="h-10 w-10 text-emerald-600" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Verifica tu correo electrónico
        </h1>

        <p className="text-gray-600 mb-2">
          Hemos enviado un email de verificación a:
        </p>

        <p className="text-emerald-700 font-semibold text-lg mb-6">
          {email || "tu correo electrónico"}
        </p>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <p className="text-gray-700 text-sm">
            Revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace de verificación para activar tu cuenta.
          </p>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          Una vez verificado tu email, podrás iniciar sesión en FutboLink.
        </p>

        {/* Resend button */}
        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg hover:from-emerald-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium shadow-md transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mb-4"
        >
          {resending ? (
            <span className="flex items-center justify-center">
              <FaSpinner className="animate-spin h-5 w-5 mr-2" />
              Reenviando...
            </span>
          ) : (
            "Reenviar email de verificación"
          )}
        </button>

        {resendMessage && (
          <div
            className={`flex items-center justify-center gap-2 text-sm mb-4 ${
              resendError ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {resendError ? (
              <FaExclamationCircle className="h-4 w-4" />
            ) : (
              <FaCheckCircle className="h-4 w-4" />
            )}
            {resendMessage}
          </div>
        )}

        <Link
          href="/Login"
          className="text-emerald-600 hover:text-emerald-800 font-medium text-sm underline"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    </div>
  );
}

export default function VerificationPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <FaSpinner className="animate-spin h-8 w-8 text-emerald-600" />
        </div>
      }
    >
      <VerificationPendingContent />
    </Suspense>
  );
}
