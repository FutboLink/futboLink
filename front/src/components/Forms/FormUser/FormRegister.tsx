"use client";

import { UserContext } from "@/components/Context/UserContext";
import { NotificationsForms } from "@/components/Notifications/NotificationsForms";
import { validationRegister } from "@/components/Validate/ValidationRegister";
import { IRegisterUser, UserType } from "@/Interfaces/IUser";
import { useRouter } from "next/navigation";
import React, { useState, useContext, useRef } from "react";
import useNationalities from "./useNationalitys";
import FormsTermins from "@/components/formsTermins/formsTermins";
import PhoneNumberInput from "@/components/utils/PhoneNumberInput";
import Image from "next/image";
import {
  FaChevronDown,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaUsers,
  FaEnvelope,
  FaGlobeAmericas,
  FaPhone,
  FaVenusMars,
  FaLock,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaBriefcase,
  FaFutbol,
  FaUsersCog,
  FaBullhorn,
  FaBuilding,
} from "react-icons/fa";
import Spinner from "@/components/utils/Spinner";

const RegistrationForm: React.FC = () => {
  const { signUp } = useContext(UserContext);
  const router = useRouter();
  const {
    nationalities,
    loading: nationalitiesLoading,
    error: nationalitiesError,
  } = useNationalities();
  const [search, setSearch] = useState<string>("");
  const [selectedNationality, setSelectedNationality] = useState<string>(""); // Nuevo estado
  const [isOpen, setIsOpen] = useState<boolean>(false); // Nacionalidad seleccionada
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserType | null>(null);

  // Definir las categorías de roles
  const roleCategories = {
    [UserType.PLAYER]: {
      name: "Futbolista",
      roles: ["Jugador"]
    },
    "CUERPO_TECNICO": {
      name: "Cuerpo Técnico / Staff Deportivo",
      roles: [
        "Entrenador", // puede publicar oferta
        "Director Técnico", // puede publicar oferta
        "Director Deportivo", // puede publicar oferta
        "Scout", // puede publicar oferta
        "Entrenador de porteros",
        "Preparador físico",
        "Analista",
        "Fisioterapeuta",
        "Médico",
        "Nutricionista",
        "Psicólogo",
        "Árbitro",
        "Delegado",
        "Utillero",
        "Traductor",
        "Coordinador de equipo",
        "Ojeador"
      ]
    },
    "DIRECCION_COMUNICACION": {
      name: "Dirección y Comunicación",
      roles: [
        "Gerente",
        "Jefe de reclutamiento", // puede publicar oferta
        "Recursos Humanos", // puede publicar oferta
        "Finanzas",
        "Director de negocio",
        "Comercial",
        "Marketing",
        "Administrativo",
        "Inversor",
        "Científico deportivo",
        "Periodista",
        "Editor multimedia",
        "Diseñador gráfico",
        "Fotógrafo",
        "Marketing digital"
      ]
    },
    [UserType.AGENCY]: {
      name: "Profesionales Independientes / Representación",
      roles: [
        "Agente FIFA",
        "Intermediario",
        "Representante",
        "Agencia de representación"
      ]
    },
    [UserType.CLUB]: {
      name: "Entidad / Club",
      roles: [
        "Club",
        "Academia",
        "Liga",
        "Federación",
        "Agencia de representación",
        "Organizador de torneos"
      ]
    }
  };

  // Roles que pueden publicar ofertas
  const rolesCanPublishOffers = [
    "Entrenador",
    "Director Técnico", 
    "Director Deportivo",
    "Scout",
    "Jefe de reclutamiento",
    "Recursos Humanos"
  ];

  // Estado para la categoría seleccionada
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [userRegister, setUserRegister] = useState<IRegisterUser>({
    role: UserType.PLAYER,
    name: "",
    lastname: "",
    email: "",
    ubicacionActual: "",
    nationality: "",
    puesto: "",
    genre: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
    phone: "",
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

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

  // Function to reset role selection when category changes
  const handleCategoryChange = (category: string, role: UserType) => {
    setSelectedCategory(category);
    setSelectedRole(role);
    // Reset the puesto field when category changes
    setUserRegister(prev => ({ ...prev, puesto: "" }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoggingIn(true);

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

    // selectedRole is guaranteed by pre-selection screen

    // Instead of spreading the user object, explicitly select only
    // the fields we want to send to the backend
    const registrationData: IRegisterUser = {
      name: userRegister.name,
      lastname: userRegister.lastname,
      email: userRegister.email,
      password: userRegister.password,
      role: selectedRole as UserType,
      ubicacionActual: userRegister.ubicacionActual || "",
      nationality: selectedNationality || "",
      genre: userRegister.genre || "",
      puesto: userRegister.puesto || "",
      nameAgency: userRegister.nameAgency || "",
      phone: userRegister.phone || "",
    };

    // Log what we're sending
    console.log(
      "FormRegister - datos para registro:",
      JSON.stringify(registrationData, null, 2)
    );

    try {
      const isRegistered = await signUp(registrationData);
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
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Pre-selección de tipo de perfil antes del formulario
  if (!selectedRole) {
    return (
      <div className="min-h-screen pb-44 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-1 px-4">
        <header className="text-center mb-1 w-full max-w-xl">
          <div className="inline-block mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl px-8 py-4 shadow-lg">
              Elegí tu tipo de perfil
            </h1>
          </div>
          <p className="text-gray-600 mb-12 mt-2">
            Antes de registrarte, seleccioná la opción que mejor te represente.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <button
            type="button"
            onClick={() => handleCategoryChange(UserType.PLAYER, UserType.PLAYER)}
            className="group bg-white border border-emerald-100 hover:border-emerald-400 rounded-2xl shadow-md hover:shadow-lg p-6 flex flex-col items-center justify-center transition-all"
          >
            <FaFutbol className="h-10 w-10 text-gray-400 mb-3" />
            <span className="text-lg font-semibold text-emerald-800">Futbolista</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("CUERPO_TECNICO", UserType.PLAYER)}
            className="group bg-white border border-emerald-100 hover:border-emerald-400 rounded-2xl shadow-md hover:shadow-lg p-6 flex flex-col items-center justify-center transition-all"
          >
            <FaUsersCog className="h-10 w-10 text-gray-400 mb-3" />
            <span className="text-lg font-semibold text-emerald-800">Cuerpo Técnico / Staff Deportivo</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("DIRECCION_COMUNICACION", UserType.PLAYER)}
            className="group bg-white border border-emerald-100 hover:border-emerald-400 rounded-2xl shadow-md hover:shadow-lg p-6 flex flex-col items-center justify-center transition-all"
          >
            <FaBullhorn className="h-10 w-10 text-gray-400 mb-3" />
            <span className="text-lg font-semibold text-emerald-800">Dirección y Comunicación</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange(UserType.AGENCY, UserType.AGENCY)}
            className="group bg-white border border-emerald-100 hover:border-emerald-400 rounded-2xl shadow-md hover:shadow-lg p-6 flex flex-col items-center justify-center transition-all"
          >
            <FaBriefcase className="h-10 w-10 text-gray-400 mb-3" />
            <span className="text-lg font-semibold text-emerald-800">Profesionales Independientes / Representación 💼</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange(UserType.CLUB, UserType.CLUB)}
            className="group bg-white border border-emerald-100 hover:border-emerald-400 rounded-2xl shadow-md hover:shadow-lg p-6 flex flex-col items-center justify-center transition-all md:col-span-2"
          >
            <FaBuilding className="h-10 w-10 text-gray-400 mb-3" />
            <span className="text-lg font-semibold text-emerald-800">Entidad / Club</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4">
      {/* Spinner de pantalla completa */}
      {isLoggingIn && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
          <Spinner size="xl" />
        </div>
      )}

      <header className="text-center mb-8 w-full max-w-3xl">
       

        <div className="flex flex-col md:flex-row items-center justify-center bg-white rounded-xl shadow-lg p-6 gap-6 border border-emerald-100">
          <div className="flex-shrink-0 bg-gradient-to-br from-emerald-50 to-green-50 p-3 rounded-2xl shadow-inner">
            <Image
              src="/logoD.png"
              height={60}
              width={60}
              alt="FutboLink logo"
              className="rounded-2xl"
            />
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-emerald-800">
              Registro para Jugadores y Profesionales
            </h2>
            <p className="text-gray-600 mt-2">
              ¡Regístrate ahora y empieza a explorar oportunidades laborales en
              el fútbol!
            </p>
            <p className="text-sm text-emerald-500 font-medium mt-2">
              Unite a la comunidad de Futbolink
            </p>
          </div>
        </div>
      </header>

      <form
        className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 border border-emerald-50"
        onSubmit={handleSubmit}
      >
        {/* Sección de información profesional */}
        <div className="md:col-span-2">
          <h3 className="text-xl font-semibold text-emerald-700 border-b pb-2 mb-4 flex items-center">
            <span className="bg-emerald-100 text-emerald-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
              1
            </span>
            Información Profesional
          </h3>
        </div>

        {/* Rol */}
        <div className="flex flex-col col-span-full">
          <label className="block text-gray-700 mb-2 font-medium">
            Rol <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="puesto"
              value={userRegister.puesto}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              required
            >
              <option value="">Seleccione su rol</option>
              {selectedCategory && roleCategories[selectedCategory as keyof typeof roleCategories]?.roles.map((role, index) => (
                <option key={index} value={role}>
                  {role}
                  {rolesCanPublishOffers.includes(role) }
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBriefcase className="h-5 w-5 text-gray-400" />
            </div>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FaChevronDown className="text-gray-500" />
            </div>
          </div>
          {selectedCategory && (
            <p className="text-sm text-emerald-600 mt-1">
              Categoría seleccionada: {roleCategories[selectedCategory as keyof typeof roleCategories]?.name}
            </p>
          )}
        </div>

        {/* Nombre de la Agencia - Solo para agencias */}
        {selectedCategory === UserType.AGENCY && (
          <div className="flex flex-col col-span-full">
            <label className="block text-gray-700 mb-2 font-medium">
              Nombre de la Agencia <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="nameAgency"
                value={userRegister.nameAgency || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Nombre de tu agencia o empresa"
                required={selectedCategory === UserType.AGENCY}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaBuilding className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        )}

        {/* Sección de información personal */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-xl font-semibold text-emerald-700 border-b pb-2 mb-4 flex items-center">
            <span className="bg-emerald-100 text-emerald-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
              2
            </span>
            Información Personal
          </h3>
        </div>

        {/* Nombre */}
        <div className="flex flex-col">
          <label className="block text-gray-700 mb-2 font-medium">
            Nombre <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={userRegister.name}
              onBlur={handleBlur}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Tu nombre"
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          {touched.name && errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <FaExclamationCircle className="h-4 w-4 mr-1" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Apellidos */}
        <div className="flex flex-col">
          <label className="block text-gray-700 mb-2 font-medium">
            Apellido <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="lastname"
              value={userRegister.lastname}
              onBlur={handleBlur}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Tu apellido"
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUsers className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          {touched.lastname && errors.lastname && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <FaExclamationCircle className="h-4 w-4 mr-1" />
              {errors.lastname}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="block text-gray-700 mb-2 font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={userRegister.email}
              onBlur={handleBlur}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="tu@email.com"
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          {touched.email && errors.email && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <FaExclamationCircle className="h-4 w-4 mr-1" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Nacionalidad */}
        <div className="flex flex-col relative" ref={dropdownRef}>
          <label
            htmlFor="nationalitySearch"
            className="block text-gray-700 mb-2 font-medium"
          >
            Nacionalidad <span className="text-red-500">*</span>
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaGlobeAmericas className="h-5 w-5 text-gray-400" />
            </div>
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
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <FaChevronDown
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={toggleDropdown}
            />
            {isOpen && (
              <div className="absolute left-0 right-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto z-20">
                {nationalitiesLoading && (
                  <div className="p-3 flex items-center justify-center text-gray-500">
                    <FaSpinner className="animate-spin h-5 w-5 mr-2 text-emerald-500" />
                    <span>Cargando nacionalidades...</span>
                  </div>
                )}
                {nationalitiesError && (
                  <p className="text-red-500 p-3">{nationalitiesError}</p>
                )}
                <ul>
                  {nationalities
                    .filter((n) =>
                      n.label.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((n) => (
                      <li
                        key={n.value}
                        className="p-3 cursor-pointer text-gray-700 hover:bg-emerald-50 flex items-center"
                        onClick={() => {
                          handleSelectNationality(n.label);
                          setSearch(n.label);
                          setIsOpen(false);
                        }}
                      >
                        <FaCheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
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
          <label className="block text-gray-700 mb-2 font-medium">
            Teléfono:
          </label>
          <div className="relative">
            <PhoneNumberInput
              mode="edit"
              name="phone"
              label=""
              value={userRegister?.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FaPhone className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Género */}
        <div className="flex flex-col">
          <label className="block text-gray-700 mb-2 font-medium">
            Género <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="genre"
              value={userRegister.genre}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
              required
            >
              <option value="">Selecciona tu género</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otr@s</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaVenusMars className="h-5 w-5 text-gray-400" />
            </div>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FaChevronDown className="text-gray-500" />
            </div>
          </div>
          {errors.genre && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <FaExclamationCircle className="h-4 w-4 mr-1" />
              {errors.genre}
            </p>
          )}
        </div>

        {/* País de Residencia Actual - Para todas las categorías */}
        <div className="flex flex-col">
          <label className="block text-gray-700 mb-2 font-medium">
            País de Residencia Actual
          </label>
          <div className="relative">
            <input
              type="text"
              name="ubicacionActual"
              value={userRegister.ubicacionActual}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="País donde resides actualmente"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaGlobeAmericas className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Sección de seguridad */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-xl font-semibold text-emerald-700 border-b pb-2 mb-4 flex items-center">
            <span className="bg-emerald-100 text-emerald-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-sm">
              3
            </span>
            Seguridad
          </h3>
        </div>

        {/* Contraseña */}
        <div className="flex flex-col">
          <label className="block text-gray-700 mb-2 font-medium">
            Contraseña <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={userRegister.password}
              onBlur={handleBlur}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Crea una contraseña segura"
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {!showPassword ? (
                <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
              ) : (
                <FaEye className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
              )}
            </button>
          </div>
          {touched.password && errors.password && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <FaExclamationCircle className="h-4 w-4 mr-1" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirmar Contraseña */}
        <div className="flex flex-col">
          <label className="block text-gray-700 mb-2 font-medium">
            Confirmar Contraseña <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={userRegister.confirmPassword}
              onBlur={handleBlur}
              onChange={handleChange}
              className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder="Confirma tu contraseña"
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {!showConfirmPassword ? (
                <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
              ) : (
                <FaEye className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
              )}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <FaExclamationCircle className="h-4 w-4 mr-1" />
              {errors.confirmPassword}
            </p>
          )}
        </div>



        {/* Términos */}
        <div className="flex items-start col-span-full mt-2">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={userRegister.termsAccepted}
              onChange={handleChange}
              className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label className="text-gray-700">Acepto los</label>
            <button
              type="button"
              className="text-emerald-600 hover:text-emerald-800 font-medium pl-1"
              onClick={() => setShowTerms(true)}
            >
              términos y condiciones
            </button>
            <p className="text-gray-500 mt-1">
              Al crear una cuenta, aceptas nuestras políticas de privacidad y
              condiciones de uso.
            </p>
          </div>
        </div>

        {showTerms && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-3xl w-11/12 max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowTerms(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <FormsTermins />
            </div>
          </div>
        )}

        {/* Botón */}
        <div className="flex justify-center col-span-full mt-4">
          <button
            type="submit"
            className={`w-full py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg hover:from-emerald-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 font-medium shadow-md transition-all duration-300 transform hover:-translate-y-0.5 ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin h-5 w-5 mr-3 text-white" />
                Registrando...
              </div>
            ) : (
              "Registrarse"
            )}
          </button>
        </div>

        

        {/* Notificación */}
        {showNotification && (
          <div className="absolute top-20 left-0 right-0 mx-auto w-max col-span-full z-50 animate-fade-in-down">
            <NotificationsForms message={notificationMessage} />
          </div>
        )}
      </form>
    </div>
  );
};

export default RegistrationForm;
