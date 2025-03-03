/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { UserContext } from "@/components/Context/UserContext";
import { NotificationsForms } from "@/components/Notifications/NotificationsForms";
import { validationRegister } from "@/components/Validate/ValidationRegister";
import { IRegisterUser, UserType } from "@/Interfaces/IUser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useContext } from "react";
import useNationalities from "@/components/Forms/FormUser/useNationalitys";
import FormsTermins from "@/components/formsTermins/formsTermins";

const AgencyForm: React.FC = () => {
  const { signUp } = useContext(UserContext);
  const router = useRouter();
  const { nationalities, loading, error } = useNationalities();
  const [search, setSearch] = useState<string>(""); // Estado para el texto de búsqueda
  const [isOpen, setIsOpen] = useState<boolean>(false); // Estado para manejar la apertura del menú
  const [selectedNationality, setSelectedNationality] = useState<string>(""); // Nacionalidad seleccionada

  const [userRegister, setUserRegister] = useState<IRegisterUser>({
    role: UserType.RECRUITER,
    name: "",
    lastname: "",
    email: "",
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
          router.push("/");
        }, 2000);
      } else {
        setErrors({
          ...errors,
          general: "Registro inválido. Por favor, revisa los datos ingresados.",
        });
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error desconocido."
      );
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col mt-12 items-center justify-center bg-gray-100 py-10 px-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold bg-white text-green-600 border-green-600 border-2 rounded-lg p-2">
          Crea una cuenta
        </h2>
        <p className="text-sm text-gray-500">
          ¡Regístrate ahora y empieza a explorar oportunidades laborales en el
          fútbol!
        </p>
      </div>

      <form
        className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-lg md:max-w-2xl lg:max-w-3xl grid grid-cols-1 gap-4"
        onSubmit={handleSubmit}
      >
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={userRegister.name}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">
              Apellidos <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastname"
              value={userRegister.lastname}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={userRegister.email}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Nacionalidad (Búsqueda y Selección) */}
        <div className="relative">
          <label className="block text-gray-700 mb-1">
            Buscar Nacionalidad
          </label>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar nacionalidad..."
            onClick={toggleDropdown}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3"
          />
          {isOpen && (
            <div className="absolute left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-auto z-10">
              {loading && <p className="p-2">Cargando...</p>}
              {nationalities
                .filter((n) =>
                  n.label.toLowerCase().includes(search.toLowerCase())
                )
                .map((n) => (
                  <p
                    key={n.value}
                    onClick={() => handleSelectNationality(n.label)}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    {n.label}
                  </p>
                ))}
            </div>
          )}
        </div>

        {/* Nacionalidad Seleccionada */}
        <div>
          <label className="block text-gray-700 mb-1">
            Nacionalidad Seleccionada <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={selectedNationality}
            readOnly
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 bg-gray-100"
          />
        </div>

        {/* Género */}
        <div>
          <label className="block text-gray-700 mb-1">
            Género <span className="text-red-500">*</span>
          </label>
          <select
            name="genre"
            value={userRegister.genre}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3"
            required
          >
            <option value="">Selecciona</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        {/* Contraseña y Confirmar Contraseña */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={userRegister.password}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">
              Confirmar Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={userRegister.confirmPassword}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex items-center">
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
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-full sm:w-3/4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500"
          >
            Registrarse
          </button>
        </div>

        {/* Notificaciones */}
        {showNotification && (
          <div className="fixed top-12 left-0 right-0 mx-auto w-max">
            <NotificationsForms message={notificationMessage} />
          </div>
        )}
      </form>
    </div>
  );
};

export default AgencyForm;
