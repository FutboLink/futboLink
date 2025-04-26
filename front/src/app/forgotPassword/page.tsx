"use client";

import { useState } from "react";
import { forgotPassword } from "@/components/Fetchs/UsersFetchs/UserFetchs";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setMessage("⚠️ Por favor, ingresa tu email.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { success } = await forgotPassword(email);

    setLoading(false);

    if (success) {
      setSuccess(true);
      setMessage(
        "✅ ¡Listo! Hemos enviado un email para restablecer tu contraseña. Por favor, revisa tu casilla de correo (y también la carpeta de spam)."
      );
    } else {
      setMessage("❌ Ocurrió un error al enviar el email. Inténtalo nuevamente.");
    }
  };

  return (
    <div className="mx-auto mt-28 max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-3xl font-extrabold text-gray-700 sm:text-4xl mb-6">
          Restablecer Contraseña
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mx-auto bg-white mb-0 mt-10 max-w-md space-y-6 p-8 shadow-2xl shadow-gray-500/50 rounded-2xl"
        >
          <div>
            <input
              type="email"
              placeholder="Escribe tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={success || loading}
              className="w-full rounded-xl border-2 border-gray-300 p-4 pe-12 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
            />
          </div>

          {message && (
            <div
              className={`text-center text-md font-medium p-3 rounded-lg ${
                success
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-600 border border-red-300"
              }`}
            >
              {message}
            </div>
          )}

          {!success && (
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-700 hover:bg-green-900 px-5 py-3 text-sm font-bold text-white shadow-md transition-colors duration-300 disabled:bg-green-400"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                "Solicitar restablecer contraseña"
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
