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
  const [search, setSearch] = useState<string>("");
  const [selectedNationality, setSelectedNationality] = useState<string>(""); // Nuevo estado
  const [isOpen, setIsOpen] = useState<boolean>(false); // Nacionalidad seleccionada
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
    puesto: "",
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

  const handleSelectNationality = (nationality: string) => {
    setSelectedNationality(nationality); // Guardamos la nacionalidad seleccionada
    setSearch(""); // Limpiamos el input para que no quede texto escrito
    setIsOpen(false); // Cerramos el desplegable
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
      {/* Título y Descripción */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-4 bg-white text-verde-oscuro border-verde-oscuro border-2 rounded-lg p-2">
          Crea una cuenta
        </h2>
        <p className="text-sm text-gray-500">
          ¡Regístrate ahora y empieza a explorar las oportunidades laborales en
          el fútbol!
        </p>
      </div>

      {/* Formulario de Registro */}
      <form
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 relative"
        onSubmit={handleSubmit}
      >
        {/* Primera Columna */}
        <div className="flex flex-col gap-4">
          {/* Rol */}
          <div>
            <label className="block text-gray-700 mb-2">Rol:</label>
            <select
              name="puesto"
              value={userRegister.puesto}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div>
            <label className="block text-gray-700 mb-2">Nombre *</label>
            <input
              type="text"
              name="name"
              value={userRegister.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Apellidos */}
          <div>
            <label className="block text-gray-700 mb-2">Apellidos *</label>
            <input
              type="text"
              name="lastname"
              value={userRegister.lastname}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.lastname && (
              <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>
            )}
          </div>

          {/* Nacionalidad */}
          <div className="relative w-full">
            <label className="block text-gray-700 mb-1">
              Buscar Nacionalidad
            </label>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              onClick={() => setIsOpen(true)}
              placeholder={selectedNationality || "Buscar nacionalidad..."}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="p-2 hover:bg-gray-200 cursor-pointer text-gray-700"
                    >
                      {n.label}
                    </p>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Segunda Columna */}
        <div className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={userRegister.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Género */}
          <div>
            <label className="block text-gray-700 mb-2">Género *</label>
            <select
              name="genre"
              value={userRegister.genre}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div>
            <label className="block text-gray-700 mb-2">Contraseña *</label>
            <input
              type="password"
              name="password"
              value={userRegister.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-gray-700 mb-2">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={userRegister.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Checkbox de Términos */}
        <div className="col-span-1 md:col-span-2 flex items-center">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={userRegister.termsAccepted}
            onChange={handleChange}
            required
            className="mr-2"
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

        {/* Botón de Registro */}
        <div className="col-span-1 md:col-span-2 flex justify-center">
          <button
            type="submit"
            className="w-full py-2 bg-verde-oscuro text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-verde-claro"
          >
            Registrarse
          </button>
        </div>

        {/* Notificación */}
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
