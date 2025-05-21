"use client";

import { useState, useEffect } from "react";
import { forgotPassword } from "@/components/Fetchs/UsersFetchs/UserFetchs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [corsError, setCorsError] = useState(false);
  const [directLinkMode, setDirectLinkMode] = useState(false);
  const router = useRouter();

  // Determinar si estamos en modo desarrollo (localhost)
  useEffect(() => {
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    if (isLocalhost) {
      console.log("Modo desarrollo detectado. Ofreciendo opciones alternativas.");
    }
    
    // Verificar si existe un token de reseteo en localStorage
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('resetPasswordToken');
      if (savedToken) {
        console.log("Token de reseteo encontrado en localStorage. Redirigiendo...");
        router.push(`/resetPassword?token=${savedToken}`);
      }
    }
  }, [router]);

  // Extraer email de la URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('email');
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setMessage("⚠️ Por favor, ingresa tu email.");
      return;
    }

    setLoading(true);
    setMessage("");
    setCorsError(false);

    try {
      if (directLinkMode) {
        // En modo enlace directo, abrimos la versión de producción en una nueva pestaña
        window.open(`https://futbolink.vercel.app/forgotPassword?email=${encodeURIComponent(email)}`, '_blank');
        setMessage("✅ Redirigiendo a la versión de producción donde podrás completar el proceso.");
        setLoading(false);
        return;
      }

      const response = await forgotPassword(email);
      
      if (response.success) {
        setSuccess(true);
        
        if (response.directReset) {
          setMessage("✅ Verificación exitosa. Redirigiendo para restablecer tu contraseña...");
          // No necesitamos redirigir aquí, la función forgotPassword ya lo hace
        } else {
          setMessage(
            "✅ ¡Listo! Hemos enviado un email para restablecer tu contraseña. Por favor, revisa tu casilla de correo (y también la carpeta de spam)."
          );
        }
      } else {
        if (response.error === "CORS") {
          setCorsError(true);
          setMessage("❌ Se detectó un problema de CORS. Selecciona una de las opciones alternativas a continuación.");
        } else {
          setMessage("❌ " + response.message);
        }
      }
    } catch (err) {
      console.error("Error al solicitar recuperación:", err);
      setMessage("❌ Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLinkMode = () => {
    setDirectLinkMode(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (message) setMessage("");
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email)
      .then(() => {
        setMessage("✅ Email copiado al portapapeles. Úsalo en la versión de producción.");
        setTimeout(() => setMessage(""), 3000);
      })
      .catch(err => {
        console.error("Error al copiar:", err);
        setMessage("❌ No se pudo copiar al portapapeles.");
      });
  };

  return (
    <div className="mx-auto mt-20 max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-center text-3xl font-bold text-green-700 sm:text-4xl mb-6">
          Recuperar Contraseña
        </h1>
        
        {directLinkMode ? (
          <div className="bg-white p-8 rounded-xl shadow-2xl">
            <p className="text-center text-gray-700 mb-6">
              Para evitar problemas de CORS en desarrollo local, usa el botón de abajo para abrir 
              la versión de producción de FutboLink donde podrás completar el proceso.
            </p>
            
            <div className="flex flex-col space-y-4">
              <a 
                href={`https://futbolink.vercel.app/forgotPassword?email=${encodeURIComponent(email)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 w-full bg-green-600 text-white text-center rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                Abrir en FutboLink Producción
              </a>
              
              <button
                onClick={handleCopyEmail}
                className="py-2 px-4 w-full border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Copiar Email
              </button>
              
              <button 
                onClick={() => setDirectLinkMode(false)}
                className="text-sm text-gray-600 hover:underline"
              >
                Volver al modo normal
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-2xl">
            {message && (
              <div
                className={`mb-6 text-center p-3 rounded-lg ${
                  success
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : message.includes("✅")
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-red-100 text-red-600 border border-red-300"
                }`}
              >
                {message}
              </div>
            )}
            
            {corsError && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
                <div className="flex flex-col">
                  <p className="text-sm text-yellow-700 mb-3">
                    <strong>Error de CORS detectado:</strong> Esto ocurre habitualmente durante el desarrollo local.
                    Para continuar, elige una de estas opciones:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-yellow-700 mb-4">
                    <li>Utiliza la versión desplegada de FutboLink</li>
                    <li>Copia tu email y úsalo en la versión de producción</li>
                  </ul>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={handleDirectLinkMode}
                      className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-2 px-4 rounded transition-colors"
                    >
                      Cambiar a modo enlace directo
                    </button>
                    <a 
                      href="https://futbolink.vercel.app/forgotPassword"
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-sm text-center bg-white border border-yellow-400 hover:bg-yellow-50 text-yellow-700 font-medium py-2 px-4 rounded transition-colors"
                    >
                      Abrir versión de producción
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 p-4 text-sm shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-700"
                  />
                </div>

                <div className="flex flex-col space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 hover:bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-md transition-colors duration-300 disabled:bg-green-400"
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
                      "Recuperar Contraseña"
                    )}
                  </button>
                  
                  <Link 
                    href="/Login" 
                    className="text-center text-sm text-green-600 hover:text-green-700 hover:underline font-medium"
                  >
                    Volver a iniciar sesión
                  </Link>
                </div>
              </form>
            )}
            
            {success && (
              <div className="text-center space-y-6">
                <svg 
                  className="w-16 h-16 text-green-500 mx-auto" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                
                <p className="text-lg text-gray-700">
                  Email enviado correctamente. Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
                </p>
                
                <Link 
                  href="/Login" 
                  className="inline-block py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Volver a Iniciar Sesión
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
