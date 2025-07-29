"use client";

import { UserContext } from "@/components/Context/UserContext";
import { NotificationsForms } from "@/components/Notifications/NotificationsForms";
import { validationRegister } from "@/components/Validate/ValidationRegister";
import { IRegisterUser, UserType } from "@/Interfaces/IUser";
import { useRouter } from "next/navigation";
import React, { useState, useContext, useRef } from "react";
import useNationalities from "./useNationalitys";
import FormsTermins from "@/components/formsTermins/formsTermins";
import { FaChevronDown } from "react-icons/fa";
import PhoneNumberInput from "@/components/utils/PhoneNumberInput";

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

    // Instead of spreading the user object, explicitly select only
    // the fields we want to send to the backend
    const registrationData = {
      name: userRegister.name,
      lastname: userRegister.lastname,
      email: userRegister.email,
      password: userRegister.password,
      role: UserType.PLAYER,
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
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-10 px-4">
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
        className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-3xl relative
             grid grid-cols-1 md:grid-cols-2 gap-6"
        onSubmit={handleSubmit}
      >
        {/* Rol */}
        <div className="flex flex-col col-span-full">
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
            onBlur={handleBlur}
            value={userRegister.lastname}
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

        {/* Phone */}
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

        {/* Términos - ocupar todo el ancho */}
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

        {/* Botón - ocupar todo el ancho */}
        <div className="flex justify-center col-span-full">
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Registrarse
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

export default RegistrationForm;
