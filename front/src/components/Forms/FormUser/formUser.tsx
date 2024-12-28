"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    role: "",
    firstName: "",
    lastName: "",
    email: "",
    nationality: "",
    gender: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    if (!formData.termsAccepted) {
      alert("Debe aceptar los términos y condiciones.");
      return;
    }
    alert("Registro exitoso. Verifique su correo electrónico.");
  };

  return (
    <div className="min-h-screen mt-24 flex items-center justify-center bg-gray-100 py-10">
      <form
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 col-span-2">
          Registro de Usuario
        </h2>

        {/* Rol */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Rol:</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccione su rol</option>
            {roles.map((role, index) => (
              <option key={index} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Nombre */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nombre:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Apellidos */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Apellidos:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Nacionalidad */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nacionalidad:</label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Género */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Género:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccione su género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        {/* Contraseña */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Confirmar Contraseña */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Confirmar Contraseña:
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Aceptar Términos */}
        <div className="mb-6 col-span-2 flex items-center">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleChange}
            className="mr-2"
            required
          />
          <label className="text-gray-700">
            Acepto los términos y condiciones
          </label>
        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          className="w-full -500  text-green-600 hover:text-green-700 py-3 rounded-lg hover:-600 transition"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
