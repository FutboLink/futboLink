"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NotificationsForms } from "@/components/Notifications/NotificationsForms";
import { validationLogin } from "@/components/Validate/ValidationLogin";
import { useUserContext } from "@/hook/useUserContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Spinner from "@/components/utils/Spinner";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";

function LoginForm() {
  const { signIn } = useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tAuth = useNextIntlTranslations('auth');

  // Función para obtener el texto traducido o el texto original
  const getText = (originalText: string, translatedKey: string) => {
    return isNextIntlEnabled ? tAuth.t(translatedKey) : originalText;
  };
  const router = useRouter();
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false); // Estado para alternar visibilidad
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [errors, setErrors] = useState({} as { [key: string]: string });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });

    const { errors } = validationLogin({ ...userData, [name]: value });
    setErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { formIsValid, errors } = validationLogin(userData);

    if (formIsValid) {
      setIsLoggingIn(true);
      const credentials = {
        email: userData.email,
        password: userData.password,
      };

      try {
        const success = await signIn(credentials);
        console.log(success);
        if (success) {
          setNotificationMessage(getText("Has ingresado correctamente", "loginSuccess"));
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 2000);
          router.push("/");
        } else {
          setNotificationMessage(getText("Usuario o contraseña incorrectos", "loginError"));
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "";
        if (errorMessage === "EMAIL_NOT_VERIFIED") {
          // Redirigir a la página de verificación pendiente
          router.push(`/verify-email/pending?email=${encodeURIComponent(userData.email)}`);
        } else {
          setNotificationMessage(getText("Usuario o contraseña incorrectos", "loginError"));
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        }
      } finally {
        setIsLoggingIn(false);
      }
    } else {
      setErrors(errors);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      {/* Spinner de pantalla completa */}
      {isLoggingIn && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
          <Spinner size="xl" />
        </div>
      )}

      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-verde-oscuro">
          {getText("Iniciar sesión", "loginTitle")}
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Campo de correo */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              {getText("Correo electrónico", "email")}
            </label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder={getText("Email", "emailPlaceholder")}
              className="w-full mt-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-claro focus:border-transparent"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Campo de contraseña */}
          <div className="mb-6 relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              {getText("Contraseña", "password")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={userData.password}
                onChange={handleChange}
                placeholder={getText("Contraseña", "passwordPlaceholder")}
                className="w-full mt-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-verde-claro focus:border-transparent pr-10"
              />
              {/* Botón para mostrar/ocultar contraseña */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 mt pr-3 flex items-center"
              >
                {!showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Botón de iniciar sesión */}
          <button
            type="submit"
            className="w-full py-2 bg-verde-oscuro text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-verde-claro focus:ring-opacity-50"
          >
            {getText("Ingresar", "loginButton")}
          </button>
          {showNotification && (
            <div className="absolute top-12 left-0 right-0 mx-auto w-max">
              <NotificationsForms message={notificationMessage} />
            </div>
          )}
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          {getText("¿No tienes cuenta?", "noAccount")}{" "}
          <Link
            href="/OptionUsers"
            className="text-verde-oscuro hover:underline"
          >
            {getText("Regístrate aquí", "registerHere")}
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-gray-600">
          <Link className="underline hover:font-bold" href="/forgotPassword">
            {" "}
            {getText("Olvidé mi contraseña", "forgotPassword")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
