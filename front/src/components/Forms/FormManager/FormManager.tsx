"use client";

import { UserContext } from "@/components/Context/UserContext";
import { NotificationsForms } from "@/components/Notifications/NotificationsForms";
import { validationRegister } from "@/components/Validate/ValidationRegister";
import { IRegisterUser, UserType } from "@/Interfaces/IUser";
import { useRouter } from "next/navigation";
import React, { useState, useContext, useRef } from "react";
import useNationalities from "@/components/Forms/FormUser/useNationalitys";
import FormsTermins from "@/components/formsTermins/formsTermins";
import { FaChevronDown } from "react-icons/fa";
import PhoneNumberInput from "@/components/utils/PhoneNumberInput";
import Image from "next/image";

const ManagerForm: React.FC = () => {
  const { signUp } = useContext(UserContext);
  const router = useRouter();
  const {
    nationalities,
    loading: nationalitiesLoading,
    error: nationalitiesError,
  } = useNationalities();
  const [search, setSearch] = useState<string>(""); // Estado para el texto de búsqueda
  const [isOpen, setIsOpen] = useState<boolean>(false); // Estado para manejar la apertura del menú
  const [selectedNationality, setSelectedNationality] = useState<string>(""); // Nacionalidad seleccionada
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [userRegister, setUserRegister] = useState<IRegisterUser>({
    role: UserType.RECRUITER,
    name: "",
    lastname: "",
    email: "",
    ubicacionActual: "",
    nationality: "",
    genre: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  // Maneja el cambio en el campo de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value); // Actualiza el texto de búsqueda
    setIsOpen(true); // Asegura que el dropdown se mantenga abierto mientras se escribe
  };

  // Maneja la selección de una nacionalidad
  const handleSelectNationality = (value: string) => {
    setSelectedNationality(value); // Actualiza selectedNationality con el valor seleccionado
    setUserRegister((prevState) => ({
      ...prevState,
      nationality: value, // Actualiza el estado del formulario
    }));
    setSearch(""); // Limpia el campo de búsqueda
    setIsOpen(false); // Cierra el dropdown una vez se seleccione una opción
  };

  // Maneja la apertura y cierre del menú
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedUser = { ...userRegister, [name]: value };
    setUserRegister(updatedUser);
    setErrors(validationRegister(updatedUser));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Verificar si las contraseñas coinciden
    if (userRegister.password !== userRegister.confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: "Las contraseñas no coinciden",
      }));
      return;
    }

    // Verificar si se aceptaron los términos
    if (!userRegister.termsAccepted) {
      setErrorMessage("Debe aceptar los términos y condiciones.");
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000);
      return;
    }

    const user: IRegisterUser = { ...userRegister };

    try {
      const isRegistered = await signUp(user);
      if (isRegistered) {
        setNotificationMessage("Registro exitoso");
        setShowNotification(true);
        setTimeout(async () => {
          router.push("/manager-subscription");
        }, 2000);
      } else {
        setErrors({
          ...errors,
          general: "Registro inválido. Por favor, revisa los datos ingresados.",
        });
      }
    } catch (error: any) {
      // Intenta parsear el error del backend
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Ocurrió un error inesperado.";

      if (
        message.toLowerCase().includes("email") &&
        message.toLowerCase().includes("already")
      ) {
        setErrors((prev) => ({
          ...prev,
          email: "Este correo ya está registrado",
        }));
      } else {
        setErrorMessage(message);
        setShowErrorNotification(true);
        setTimeout(() => setShowErrorNotification(false), 3000);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-10 px-4">
      <header className="text-center mb-8 w-full max-w-3xl">
        <div className="inline-block mb-4">
          <h1 className="text-3xl font-bold bg-white text-green-600 border-2 border-green-600 rounded-lg px-6 py-3">
            Crea una cuenta
          </h1>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center bg-white rounded-lg shadow-md p-6 gap-6">
          <div className="flex-shrink-0">
            <Image
              src="/logoD.png"
              height={60}
              width={60}
              alt="FutboLink logo"
              className="rounded-2xl"
            />
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-green-700">
              Registro para Agencia/Agente
            </h2>
            <p className="text-gray-500 mt-1">
              ¡Regístrate ahora y empieza a explorar oportunidades laborales en
              el fútbol!
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Unite a la comunidad de Futbolink
            </p>
          </div>
        </div>
      </header>

      <form
        className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6"
        onSubmit={handleSubmit}
      >
        {/* Nombre */}
        <div className="flex flex-col">
          <label className="block text-gray-700 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={userRegister.name}
            onBlur={handleBlur}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {touched.name && errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Apellidos */}
        <div className="flex flex-col">
          <label className="block text-gray-700 mb-2">
            Apellidos <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastname"
            value={userRegister.lastname}
            onBlur={handleBlur}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {touched.lastname && errors.lastname && (
            <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="block text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={userRegister.email}
            onBlur={handleBlur}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {touched.email && errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Nacionalidad */}
        <div className="flex flex-col relative" ref={dropdownRef}>
          <label
            htmlFor="nationalitySearch"
            className="block text-gray-700 mb-2"
          >
            Nacionalidad <span className="text-red-500">*</span>
          </label>
          <div className="relative w-full">
            <input
              type="text"
              id="nationalitySearch"
              value={search || selectedNationality}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedNationality("");
              }}
              placeholder="Buscar nacionalidad..."
              onClick={toggleDropdown}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3"
            />
            <FaChevronDown
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={toggleDropdown}
            />
            {isOpen && (
              <div className="absolute left-0 right-0 mt-2 sm:mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto z-20">
                {nationalitiesLoading && (
                  <p className="p-2">Cargando nacionalidades...</p>
                )}
                {nationalitiesError && (
                  <p className="text-red-500 p-2">{nationalitiesError}</p>
                )}
                <ul>
                  {nationalities
                    .filter((n) =>
                      n.label.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((n) => (
                      <li
                        key={n.value}
                        className="p-2 cursor-pointer text-gray-700 hover:bg-gray-200"
                        onClick={() => {
                          handleSelectNationality(n.label);
                          setSearch(n.label);
                          setIsOpen(false);
                        }}
                      >
                        {n.label}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Teléfono */}
        <div className="flex flex-col">
          <label className="block text-gray-700">Teléfono:</label>
          <PhoneNumberInput
            mode="edit"
            name="phone"
            label=""
            value={userRegister?.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Género */}
        <div className="flex flex-col">
          <label className="block text-gray-700 mb-2 hover:cursor-pointer">
            Género <span className="text-red-500">*</span>
          </label>
          <select
            name="genre"
            value={userRegister.genre}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecciona tu género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otr@s</option>
          </select>
          {errors.genre && (
            <p className="text-red-500 text-sm mt-1">{errors.genre}</p>
          )}
        </div>

        {/* Contraseña */}
        <div className="flex flex-col">
          <label className="block text-gray-700 mb-2">
            Contraseña <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={userRegister.password}
            onBlur={handleBlur}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {touched.password && errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirmar Contraseña */}
        <div className="flex flex-col">
          <label className="block text-gray-700 mb-2">
            Confirmar Contraseña <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={userRegister.confirmPassword}
            onBlur={handleBlur}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Términos */}
        <div className="flex items-center col-span-full">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={userRegister.termsAccepted}
            onChange={handleChange}
            className="mr-2"
            required
          />
          <label className="text-gray-700">Acepto los</label>
          <button
            type="button"
            className="text-blue-500 underline hover:text-blue-700 pl-1"
            onClick={() => setShowTerms(true)}
          >
            términos y condiciones
          </button>
        </div>

        {showTerms && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-3xl w-full relative">
              <button
                onClick={() => setShowTerms(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <FormsTermins />
            </div>
          </div>
        )}

        {/* Botón */}
        <div className="flex justify-center col-span-full">
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </button>
        </div>

        {/* Notificación */}
        {showNotification && (
          <div className="absolute top-12 left-0 right-0 mx-auto w-max col-span-full">
            <NotificationsForms message={notificationMessage} />
          </div>
        )}
      </form>
    </div>
  );
};

export default ManagerForm;
