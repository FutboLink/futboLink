"use client"; // Asegura que este componente se ejecute en el cliente

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/components/Fetchs/UsersFetchs/UserFetchs";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "error" | "info" | "success" } | null>(null);
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token");
      
      if (!tokenFromUrl) {
        setStatusMessage({ 
          text: "No se encontró el token en la URL. Verifica el enlace que recibiste.", 
          type: "error" 
        });
      } else {
        setToken(tokenFromUrl);
        setStatusMessage({ 
          text: "Token encontrado. Puedes restablecer tu contraseña.", 
          type: "info" 
        });
      }
    }
  }, []);

  // Función para validar la contraseña en tiempo real
  const validatePassword = (value: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/;
    
    if (!value) {
      setErrors((prev) => ({ ...prev, password: "Debes ingresar una contraseña" }));
      return false;
    } else if (!passwordRegex.test(value)) {
      setErrors((prev) => ({
        ...prev,
        password: "Debe tener 8-15 caracteres, una mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*)",
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
    
    // Realizar validaciones antes de enviar
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(confirmPassword);
    
    if (!isPasswordValid || !isConfirmValid) {
      return;
    }
  
    if (!token) {
      setStatusMessage({ 
        text: "Token no encontrado. No se puede restablecer la contraseña.", 
        type: "error" 
      });
      return;
    }
    
    setIsSubmitting(true);
    setStatusMessage({ text: "Enviando solicitud...", type: "info" });
  
    try {
      const { success, message } = await resetPassword(token, password);
      
      if (success) {
        setStatusMessage({ text: message || "Contraseña actualizada correctamente", type: "success" });
        setResetSuccess(true);
      } else {
        setStatusMessage({ 
          text: message || "No se pudo restablecer la contraseña. Intenta de nuevo o solicita un nuevo enlace.", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      setStatusMessage({ 
        text: "Error al conectar con el servidor. Intenta de nuevo más tarde.", 
        type: "error" 
      });
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

  return (
    <div className="mx-auto mt-28 max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-bold text-gray-600 sm:text-3xl">
          Restablecer Contraseña
        </h1>
        
        {statusMessage && (
          <div className={`mt-4 p-3 rounded-lg ${
            statusMessage.type === "error" ? "bg-red-100 text-red-700" : 
            statusMessage.type === "success" ? "bg-green-100 text-green-700" : 
            "bg-blue-100 text-blue-700"
          }`}>
            {statusMessage.text}
          </div>
        )}
        
        {!resetSuccess ? (
          <form
            onSubmit={handleSubmit}
            className="mx-auto bg-white mb-0 mt-8 max-w-md space-y-4 p-8 shadow-2xl shadow-gray-500/50 rounded-lg"
          >
            <div>
              <input
                type="password"
                placeholder="Nueva Contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                required
                className="w-full rounded-lg border-2 border-gray-200 text-gray-700 p-4 pe-12 text-sm shadow-md shadow-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              {errors.password && <p className="mt-2 text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  validateConfirmPassword(e.target.value);
                }}
                required
                className="w-full rounded-lg border-2 border-gray-200 text-gray-700 p-4 pe-12 text-sm shadow-md shadow-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              {errors.confirmPassword && <p className="mt-2 text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-block shadow-md shadow-gray-400 rounded-lg bg-green-700 px-5 py-3 text-sm font-medium text-white 
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-900'}`}
              >
                {isSubmitting ? 'Procesando...' : 'Restablecer Contraseña'}
              </button>
              
              {token === null && (
                <button
                  type="button"
                  onClick={handleRequestNewLink}
                  className="inline-block shadow-md shadow-gray-400 rounded-lg bg-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Solicitar Nuevo Enlace
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="mt-16 space-y-4">
            <p className="text-lg font-medium text-gray-700">
              Has reestablecido tu contraseña correctamente, puedes ingresar ahora.
            </p>
            <button
              onClick={handleRedirectToLogin}
              className="inline-block shadow-md shadow-gray-400 rounded-lg bg-green-700 px-5 py-3 text-sm font-medium text-white hover:bg-green-900"
            >
              Ingresar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
