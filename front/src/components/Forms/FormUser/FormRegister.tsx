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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 mt-16 py-8 px-4">
    <div className="text-center mb-4">
      <h2 className="text-2xl font-bold mb-4 bg-white text-green-600 border-green-600 border-2 rounded-lg p-2">
        Crea una cuenta
      </h2>
      <p className="text-sm text-gray-500">
        ¡Regístrate ahora y empieza a explorar las oportunidades laborales en el fútbol!
      </p>
    </div>
  
    <form
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md flex flex-col gap-4"
      onSubmit={handleSubmit}
    >
      {/* Rol */}
      <div className="flex flex-col">
        <label className="block text-gray-700 text-sm">Rol:</label>
        <select
          name="puesto"
          value={userRegister.puesto}
          onChange={handleChange}
          className="w-full border text-sm border-gray-300 text-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccione su rol</option>
          {puestos.map((puesto, index) => (
            <option key={index} value={puesto}>
              {puesto}
            </option>
          ))}
        </select>
      </div>
  
      {/* Nombre */}
      <div className="flex flex-col">
        <label className="block text-gray-700 text-sm">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={userRegister.name}
          onChange={handleChange}
          className="w-full border border-gray-300 text-gray-700 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>
  
      {/* Email */}
      <div className="flex flex-col">
        <label className="block text-gray-700 text-sm">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={userRegister.email}
          onChange={handleChange}
          className="w-full border border-gray-300 text-gray-700 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>
  
      {/* Contraseña */}
      <div className="flex flex-col">
        <label className="block text-gray-700 text-sm">
          Contraseña <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          name="password"
          value={userRegister.password}
          onChange={handleChange}
          className="w-full border border-gray-300 text-gray-700 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>
  
      {/* Confirmar Contraseña */}
      <div className="flex flex-col">
        <label className="block text-gray-700 text-sm">
          Confirmar Contraseña <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={userRegister.confirmPassword}
          onChange={handleChange}
          className="w-full border border-gray-300 text-gray-700 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>
  
      <div className="flex justify-center mt-4">
        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Registrarse
        </button>
      </div>
    </form>
  </div>
  )  
};

export default RegistrationForm;
