"use client";

import { UserContext } from "@/components/Context/UserContext";
import { NotificationsForms } from "@/components/Notifications/NotificationsForms";
import { validationRegister } from "@/components/Validate/ValidationRegister";
import { IRegisterUser, UserType } from "@/Interfaces/IUser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useContext } from "react";
import useNationalities from "./useNationalitys";

const RegistrationForm: React.FC = () => {
  const { signUp } = useContext(UserContext);
  const router = useRouter();
  const { nationalities, loading, error } = useNationalities();
  const [search, setSearch] = useState<string>(''); // Estado para el texto de búsqueda
  const [isOpen, setIsOpen] = useState<boolean>(false); // Estado para manejar la apertura del menú
  const [selectedNationality, setSelectedNationality] = useState<string>(''); // Nacionalidad seleccionada

  const roles = [
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
    genre: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  
  // Maneja el cambio en el campo de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);  // Actualiza el texto de búsqueda
    setIsOpen(true);  // Asegura que el dropdown se mantenga abierto mientras se escribe
  };

  // Maneja la selección de una nacionalidad
  const handleSelectNationality = (value: string) => {
    setSelectedNationality(value);  // Actualiza selectedNationality con el valor seleccionado
    setUserRegister((prevState) => ({
      ...prevState,
      nationality: value,  // Actualiza el estado del formulario
    }));
    setSearch('');  // Limpia el campo de búsqueda
    setIsOpen(false);  // Cierra el dropdown una vez se seleccione una opción
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
          router.push("/profile");
        }, 2000);
      } else {
        setErrors({
          ...errors,
          general: "Registro inválido. Por favor, revisa los datos ingresados.",
        });
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido.");
      setShowErrorNotification(true);
      setTimeout(() => setShowErrorNotification(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 mt-16 py-10">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-4 bg-white text-green-600 border-green-600 border-2  rounded-lg p-2">
          Crea una cuenta
        </h2>
        <p className="text-sm text-gray-500">
          ¡Regístrate ahora y empieza a explorar las oportunidades laborales en el fútbol!
        </p>
      </div>
  
      <form
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-6"
        onSubmit={handleSubmit}
      >
        {/* Rol */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Rol:</label>
          <select
            name="role"
            value={userRegister.role}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option className="text-gray-700" value="">Seleccione su rol</option>
            {roles.map((role, index) => (
              <option key={index} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
  
        {/* Nombre */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nombre
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={userRegister.name}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
            required
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
  
        {/* Apellidos */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Apellidos
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastname"
            value={userRegister.lastname}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
            required
          />
          {errors.lastname && <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>}
        </div>
  
        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email
            <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={userRegister.email}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
            required
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
  
        {/* Nacionalidad */}
        <div className="mb-4 relative">
          <label htmlFor="nationalitySearch" className="block text-gray-700 mb-2">Buscar Nacionalidad</label>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar nacionalidad..."
            onClick={toggleDropdown}
            className="w-full border text-gray-700 border-gray-300 rounded-lg p-3 mb-3"
          />
        </div>
  
        {/* Nacionalidad seleccionada */}
        <div className="mb-4 relative">
          <label htmlFor="nationality" className="block text-gray-700 mb-2">Nacionalidad seleccionada
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={selectedNationality}
            readOnly
            className="w-full border text-gray-700 border-gray-300 rounded-lg p-3 mb-3"
          />
        </div>
  
        {/* Dropdown de opciones */}
        {isOpen && (
          <div className="absolute z-10 w-full sm:w-auto max-w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
            {loading && <p>Cargando nacionalidades...</p>}
            {error && <p className="text-red-500">{error}</p>}
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
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 hover:cursor-pointer">Género
            <span className="text-red-500">*</span>
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
          {errors.genre && <p className="text-red-500 text-sm mt-1">{errors.genre}</p>}
        </div>
  
        {/* Contraseña */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Contraseña
            <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={userRegister.password}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
            required
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>
  
        {/* Confirmar Contraseña */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Confirmar Contraseña
            <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={userRegister.confirmPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
            required
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
  
        {/* Aceptar Términos */}
        <div className="mb-6 col-span-2 flex items-center">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={userRegister.termsAccepted}
            onChange={handleChange}
            className="mr-2 hover:cursor-pointer"
            required
          />
          <label className="text-gray-700">
            Acepto los
          </label>
          <Link href="/termsandConditions">
            <p className="text-blue-500 underline hover:text-blue-700 pl-1">términos y condiciones</p>
          </Link>
        </div>
  
        {showErrorNotification && (
          <div className="absolute top-24 left-0 right-0 mx-auto w-max bg-red-600 text-white p-2 rounded-md">
            <p>{errorMessage}</p>
          </div>
        )}
  
        {/* Contenedor del botón */}
        <div className="flex justify-center col-span-3">
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
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
}  

export default RegistrationForm;
