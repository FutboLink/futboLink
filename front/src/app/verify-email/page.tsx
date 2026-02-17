"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import Link from "next/link";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token") || null;

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token de verificación no proporcionado.");
        return;
      }

      try {
        const response = await fetch(
          `${apiUrl}/user/verify-email?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(
            data.message || "Tu email ha sido verificado exitosamente."
          );
        } else {
          setStatus("error");
          setMessage(
            data.message || "Error al verificar el email. El enlace puede haber expirado."
          );
        }
      } catch {
        setStatus("error");
        setMessage("Error al conectar con el servidor. Inténtalo más tarde.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center border border-emerald-100">
        {status === "loading" && (
          <>
            <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <FaSpinner className="animate-spin h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Verificando tu email...
            </h1>
            <p className="text-gray-600">
              Por favor espera mientras verificamos tu cuenta.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <FaCheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              ¡Email verificado!
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/Login"
              className="inline-block w-full py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg hover:from-emerald-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium shadow-md transition-all duration-300"
            >
              Iniciar sesión
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <FaExclamationTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Error de verificación
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/Login"
                className="inline-block w-full py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg hover:from-emerald-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium shadow-md transition-all duration-300"
              >
                Ir a iniciar sesión
              </Link>
              <Link
                href="/Login/register"
                className="inline-block w-full py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all duration-300"
              >
                Registrarse de nuevo
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <FaSpinner className="animate-spin h-8 w-8 text-emerald-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
