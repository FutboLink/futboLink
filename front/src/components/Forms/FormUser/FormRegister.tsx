/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { UserContext } from "@/components/Context/UserContext";
import { NotificationsForms } from "@/components/Notifications/NotificationsForms";
import { validationRegister } from "@/components/Validate/ValidationRegister";
import { IRegisterUser, UserType } from "@/Interfaces/IUser";
import { useRouter } from "next/navigation";
import React, { useState, useContext } from "react";
import useNationalities from "./useNationalitys";
import FormsTermins from "@/components/formsTermins/formsTermins";

const RegistrationForm: React.FC = () => {
  const { signUp } = useContext(UserContext);
  const router = useRouter();
  const { nationalities, loading, error } = useNationalities();
  const [search, setSearch] = useState<string>(""); // Estado para el texto de búsqueda
  const [isOpen, setIsOpen] = useState<boolean>(false); // Estado para manejar la apertura del menú
  const [selectedNationality, setSelectedNationality] = useState<string>(""); // Nacionalidad seleccionada
  const [showTerms, setShowTerms] = useState<boolean>(false);

  const puestos = [
    "Jugador",
    "Entrenador",
    "Fisioterapeuta",
    "Preparador Físico",
    "Analista",
    "Gerente",
    "Entrenador de Porteros",
    "Coordinador",
    "Ojeador Scout",
    "Marketing Digital",
    "Director Deportivo",
    "Comercial",
    "Jefe de Reclutamiento",
    "Periodista",
    "Nutricionista",
    "Administrativo",
    "Diseñador Gráfico",
    "Director Técnico",
    "Médico",
    "Psicólogo",
    "Recursos Humanos",
    "Abogado",
    "Científico Deportivo",
    "Director de Negocio",
    "Editor Multimedia",
    "Finanzas",
    "Árbitro",
    "Delegado",
    "Profesor",
    "Ejecutivo",
    "Inversor",
    "Utillero",
    "Agente",
    "Representante",
    "Terapeuta",
  ];

  const [userRegister, setUserRegister] = useState<IRegisterUser>({
    role: UserType.PLAYER,
    name: "",
    lastname: "",
    email: "",
    nationality: "",
    puesto:"",
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

  // Maneja el cambio en el campo de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setIsOpen(true);
  };

  // Maneja la selección de una nacionalidad
  const handleSelectNationality = (value: string) => {
    setSelectedNationality(value);
    setUserRegister((prevState) => ({
      ...prevState,
      nationality: value,
    }));
    setSearch("");
    setIsOpen(false);
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

    if (userRegister.password !== userRegister.confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: "Las contraseñas no coinciden",
      }));
      return;
    }

    if (!userRegister.termsAccepted) {
      setErrorMessage("Debe aceptar los términos y condiciones.");
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000);
      return;
    }

    const user: IRegisterUser = { ...userRegister, role: UserType.PLAYER };

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 mt-16 py-10 px-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-4 bg-white text-green-600 border-green-600 border-2 rounded-lg p-2">
          Crea una cuenta
        </h2>
        <p className="text-sm text-gray-500">
          ¡Regístrate ahora y empieza a explorar las oportunidades laborales en
          el fútbol!
        </p>
      </div>

      <form
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl flex flex-col gap-6 relative"
        onSubmit={handleSubmit}
      >
        {/* Rol */}
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 mb-2">Rol:</label>
          <select
            name="puesto"
            value={userRegister.puesto}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option className="text-gray-700" value="">
              Seleccione su rol
            </option>
            {puestos.map((puesto, index) => (
              <option key={index} value={puesto}>
                {puesto}
              </option>
            ))}
          </select>
        </div>

        {/* Nombre */}
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={userRegister.name}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Apellidos */}
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 mb-2">
            Apellidos <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastname"
            value={userRegister.lastname}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
            required
          />
          {errors.lastname && (
            <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={userRegister.email}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Nacionalidad - Buscar */}
        <div className="flex flex-col mb-4 relative">
          <label
            htmlFor="nationalitySearch"
            className="block text-gray-700 mb-2"
          >
            Buscar Nacionalidad
          </label>
          <input
            type="text"
            id="nationalitySearch"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar nacionalidad..."
            onClick={toggleDropdown}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3"
          />
        </div>

        {/* Nacionalidad seleccionada */}
        <div className="flex flex-col mb-4 relative">
          <label htmlFor="nationality" className="block text-gray-700 mb-2">
            Nacionalidad seleccionada <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nationality"
            value={selectedNationality}
            readOnly
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 bg-gray-100"
          />
        </div>

        {/* Dropdown de opciones */}
        {isOpen && (
          <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
            {loading && <p className="p-2">Cargando nacionalidades...</p>}
            {error && <p className="text-red-500 p-2">{error}</p>}
            <ul>
              {nationalities
                .filter((nationality) =>
                  nationality.label.toLowerCase().includes(search.toLowerCase())
                )
                .map((nationality) => (
                  <li
                    key={nationality.value}
                    className="p-2 cursor-pointer text-gray-700 hover:bg-gray-200"
                    onClick={() => handleSelectNationality(nationality.label)}
                  >
                    {nationality.label}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Género */}
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 mb-2 hover:cursor-pointer">
            Género <span className="text-red-500">*</span>
          </label>
          <select
            name="genre"
            value={userRegister.genre}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
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
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 mb-2">
            Contraseña <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={userRegister.password}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
            required
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirmar Contraseña */}
        <div className="flex flex-col mb-4">
          <label className="block text-gray-700 mb-2">
            Confirmar Contraseña <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={userRegister.confirmPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
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

        {/* Botón de registro */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Registrarse
          </button>
        </div>

        {showNotification && (
          <div className="absolute top-12 left-0 right-0 mx-auto w-max">
            <NotificationsForms message={notificationMessage} />
          </div>
        )}
      </form>
    </div>
  );
};

export default RegistrationForm;
