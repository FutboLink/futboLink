"use client"; // Asegura que este componente se ejecute en el cliente

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/components/Fetchs/UsersFetchs/UserFetchs";
import Link from "next/link";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [statusType, setStatusType] = useState<"error" | "success" | "info" | null>(null);
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [corsError, setCorsError] = useState(false);
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [directMode, setDirectMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Primero buscar el token en la URL
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");
      
      // Si no hay token en URL, verificar en localStorage
      if (!tokenFromUrl) {
        const tokenFromStorage = localStorage.getItem('resetPasswordToken');
        
        if (tokenFromStorage) {
          setToken(tokenFromStorage);
          setMessage("Token encontrado en localStorage. Puedes restablecer tu contraseña.");
          setStatusType("info");
        } else {
          setMessage("No se encontró ningún token válido. Verifica el enlace o solicita uno nuevo.");
          setStatusType("error");
        }
      } else {
        setToken(tokenFromUrl);
        setMessage("Token encontrado. Puedes restablecer tu contraseña.");
        setStatusType("info");
      }
    }
  }, []);

  // Función para validar la contraseña en tiempo real
  const validatePassword = (value: string) => {
    if (!value) {
      setErrors((prev) => ({ ...prev, password: "Debes ingresar una contraseña" }));
      return false;
    } else if (value.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: "La contraseña debe tener al menos 8 caracteres",
      }));
      return false;
    } else {
      setErrors((prev) => ({ ...prev, password: "" }));
      return true;
    }
  };

  // Función para validar la confirmación en tiempo real
  const validateConfirmPassword = (value: string) => {
    if (!value) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Debes confirmar la contraseña" }));
      return false;
    } else if (value !== password) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Las contraseñas no coinciden" }));
      return false;
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Formulario enviado");
    
    // Realizar validaciones antes de enviar
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(confirmPassword);
    
    if (!isPasswordValid || !isConfirmValid) {
      console.log("Validación fallida:", { isPasswordValid, isConfirmValid });
      return;
    }
  
    if (!token) {
      setMessage("Token no encontrado. No se puede restablecer la contraseña."); 
      setStatusType("error");
      console.log("No hay token disponible para restablecer contraseña");
      return;
    }
    
    // Mostrar información del token para debugging
    console.log(`Usando token: ${token.substring(0, 10)}... (${token.length} caracteres)`);
    
    setIsSubmitting(true);
    setMessage("Enviando solicitud...");
    setStatusType("info");
  
    try {
      console.log("Enviando solicitud de reset con password de longitud:", password.length);
      const result = await resetPassword(token, password);
      console.log("Respuesta recibida:", result);
      
      if (result.success) {
        // Limpiar localStorage al completar el proceso
        if (typeof window !== 'undefined') {
          localStorage.removeItem('resetPasswordToken');
          localStorage.removeItem('resetPasswordEmail');
          console.log("LocalStorage limpiado");
        }
        
        setMessage(result.message || "Contraseña actualizada correctamente");
        setStatusType("success");
        setResetSuccess(true);
        console.log("Reset exitoso");
      } else {
        if (result.error === "CORS") {
          console.log("Error de CORS detectado");
          setCorsError(true);
          setMessage("Se detectó un problema de CORS al intentar conectar con el servidor.");
        } else {
          console.log("Error en la respuesta:", result.message);
          setMessage(result.message || "No se pudo restablecer la contraseña. Intenta de nuevo o solicita un nuevo enlace.");
        }
        setStatusType("error");
      }
    } catch (error) {
      console.error("Error inesperado al restablecer la contraseña:", error);
      setMessage("Error al conectar con el servidor. Intenta de nuevo más tarde.");
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
      console.log("Proceso de envío completado");
    }
  };

  // Función alternativa para restablecer contraseña directamente
  const resetPasswordDirectly = async () => {
    if (!token) {
      setMessage("Token no encontrado. No se puede restablecer la contraseña.");
      setStatusType("error");
      return;
    }

    // Validar los campos primero
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(confirmPassword);
    
    if (!isPasswordValid || !isConfirmValid) {
      return;
    }

    setIsSubmitting(true);
    setMessage("Enviando solicitud directamente...");
    setStatusType("info");

    try {
      console.log("Enviando solicitud directa de reset con password");
      const result = await resetPassword(token, password);
      console.log("Respuesta recibida directamente:", result);
      
      if (result.success) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('resetPasswordToken');
          localStorage.removeItem('resetPasswordEmail');
        }
        
        setMessage(result.message || "Contraseña actualizada correctamente");
        setStatusType("success");
        setResetSuccess(true);
      } else {
        if (result.error === "CORS") {
          setCorsError(true);
          setMessage("Se detectó un problema de CORS al intentar conectar con el servidor.");
        } else {
          setMessage(result.message || "No se pudo restablecer la contraseña. Intenta de nuevo o solicita un nuevo enlace.");
        }
        setStatusType("error");
      }
    } catch (error) {
      console.error("Error en reseteo directo:", error);
      setMessage("Error al conectar con el servidor. Intenta de nuevo más tarde.");
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedirectToLogin = () => {
    router.push("/Login");
  };

  const handleRequestNewLink = () => {
    router.push("/forgotPassword");
  };

  const handleOpenProduction = () => {
    if (token) {
      window.open(`https://futbolink.vercel.app/resetPassword?token=${token}`, '_blank');
      setMessage("Abriendo la versión de producción en una nueva pestaña donde podrás completar el proceso.");
      setStatusType("info");
    } else {
      setMessage("No hay token disponible para abrir la versión de producción.");
      setStatusType("error");
    }
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token)
        .then(() => {
          setMessage("Token copiado al portapapeles. Úsalo en la versión de producción.");
          setStatusType("success");
        })
        .catch(err => {
          console.error("Error al copiar:", err);
          setMessage("No se pudo copiar al portapapeles.");
          setStatusType("error");
        });
    }
  };

  // Function to request a new token directly from this page
  const requestNewToken = async () => {
    const email = localStorage.getItem('resetPasswordEmail');
    
    if (!email) {
      setMessage("No hay email guardado para solicitar un nuevo token. Por favor, vuelve al inicio del proceso.");
      setStatusType("error");
      return;
    }
    
    setMessage(`Solicitando nuevo token para ${email}...`);
    setStatusType("info");
    setIsSubmitting(true);
    
    try {
      // Importar dynamically la función que necesitamos
      const { forgotPassword } = await import('@/components/Fetchs/UsersFetchs/UserFetchs');
      
      // Solicitar nuevo token
      const response = await forgotPassword(email);
      
      if (response.success && response.token) {
        setToken(response.token);
        setMessage("Nuevo token generado correctamente. Intenta cambiar la contraseña ahora.");
        setStatusType("success");
      } else {
        setMessage(response.message || "No se pudo generar un nuevo token. Intenta desde la página de recuperación.");
        setStatusType("error");
      }
    } catch (error) {
      console.error("Error al solicitar nuevo token:", error);
      setMessage("Error al conectar con el servidor. Intenta desde la página de recuperación.");
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-center text-3xl font-bold text-green-700 sm:text-4xl mb-6">
          Restablecer Contraseña
        </h1>
        
        {message && statusType && (
          <div className={`mb-6 p-4 rounded-lg ${
            statusType === "error" ? "bg-red-100 text-red-700 border border-red-300" : 
            statusType === "success" ? "bg-green-100 text-green-700 border border-green-300" : 
            "bg-blue-100 text-blue-700 border border-blue-300"
          }`}>
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
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleOpenProduction}
                  className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-2 px-4 rounded transition-colors"
                >
                  Abrir en la versión de producción
                </button>
                <button
                  onClick={handleCopyToken}
                  className="text-sm bg-white border border-yellow-400 hover:bg-yellow-50 text-yellow-700 font-medium py-2 px-4 rounded transition-colors"
                >
                  Copiar token
                </button>
                <a 
                  href="https://futbolink.vercel.app/resetPassword"
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-sm text-center bg-white border border-yellow-400 hover:bg-yellow-50 text-yellow-700 font-medium py-2 px-4 rounded transition-colors"
                >
                  Ir manualmente a la versión de producción
                </a>
              </div>
            </div>
          </div>
        )}
        
        {!resetSuccess && !corsError && (
          <div className="bg-white p-8 rounded-xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Ingresa tu nueva contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  required
                  className="w-full rounded-lg border border-gray-300 p-4 text-sm shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-700"
                />
                {errors.password && <p className="mt-2 text-red-500 text-sm">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirma tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validateConfirmPassword(e.target.value);
                  }}
                  required
                  className="w-full rounded-lg border border-gray-300 p-4 text-sm shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 text-gray-700"
                />
                {errors.confirmPassword && <p className="mt-2 text-red-500 text-sm">{errors.confirmPassword}</p>}
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !token}
                  onClick={(e) => {
                    console.log("Botón de restablecer contraseña clickeado");
                    // El formulario se encargará del envío a través de handleSubmit
                  }}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                    isSubmitting || !token
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isSubmitting ? "Procesando..." : "Restablecer Contraseña"}
                </button>
                
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={requestNewToken}
                  className="w-full py-2 px-4 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                >
                  Generar Nuevo Token
                </button>
                
                {token === null && (
                  <button
                    type="button"
                    onClick={handleRequestNewLink}
                    className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Solicitar nuevo enlace
                  </button>
                )}
                
                <Link 
                  href="/Login" 
                  className="text-center text-sm text-green-600 hover:text-green-700 hover:underline font-medium"
                >
                  Volver a iniciar sesión
                </Link>
              </div>
            </form>
          </div>
        )}
        
        {resetSuccess && (
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center space-y-6">
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
            
            <h2 className="text-xl font-bold text-gray-800">¡Listo!</h2>
            
            <p className="text-lg text-gray-700">
              Has restablecido tu contraseña correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>
            
            <button
              onClick={handleRedirectToLogin}
              className="inline-block py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
