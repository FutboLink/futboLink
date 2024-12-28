"use client";

import { useState } from "react";

function AgencyForm() {
  const [formData, setFormData] = useState({
    profilePhoto: null as File | null,
    firstName: "",
    lastName: "",
    organizationName: "",
    location: {
      country: "",
      city: "",
      postalCode: "",
    },
    phone: "",
    email: "",
    website: "",
    socialMedia: {
      instagram: "",
      facebook: "",
      youtube: "",
      x: "",
      transfermarkt: "",
    },
    organizationType: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        [name]: value,
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFormData({
      ...formData,
      profilePhoto: file || null,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 text-black p-6 mt-28 max-w-4xl mx-auto bg-white shadow-md rounded-md"
    >
      <h2 className="text-2xl font-semibold text-center">
        Formulario para Reclutador
      </h2>

      {/* Foto de perfil */}
      <div className="flex flex-col">
        <label className="text-lg font-semibold text-gray-700">
          Foto de perfil
        </label>
        <input
          type="file"
          name="profilePhoto"
          onChange={handleFileChange}
          className="mt-2 p-2 border rounded-md shadow-lg"
        />
      </div>

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="text-lg font-semibold text-gray-700">Nombre</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="mt-2 p-2 border rounded-md shadow-lg"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-lg font-semibold text-gray-700">
            Apellido
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="mt-2 p-2 border rounded-md shadow-lg"
            required
          />
        </div>
      </div>

      {/* Nombre de la entidad y Ubicación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="text-lg font-semibold text-gray-700">
            Nombre de la entidad
          </label>
          <input
            type="text"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleInputChange}
            className="mt-2 p-2 border rounded-md shadow-lg"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-lg font-semibold text-gray-700">
            Ubicación
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              name="country"
              value={formData.location.country}
              onChange={handleLocationChange}
              className="p-2 border rounded-md shadow-lg"
              placeholder="País"
              required
            />
            <input
              type="text"
              name="city"
              value={formData.location.city}
              onChange={handleLocationChange}
              className="p-2 border rounded-md shadow-lg"
              placeholder="Ciudad"
              required
            />
            <input
              type="text"
              name="postalCode"
              value={formData.location.postalCode}
              onChange={handleLocationChange}
              className="p-2 border rounded-md shadow-lg"
              placeholder="Código Postal"
              required
            />
          </div>
        </div>
      </div>

      {/* Teléfono y Gmail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="text-lg font-semibold text-gray-700">
            Teléfono
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-2 p-2 border rounded-md shadow-lg"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-lg font-semibold text-gray-700">Gmail</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-2 p-2 border rounded-md shadow-lg"
            required
          />
        </div>
      </div>

      {/* Sitio web */}
      <div className="flex flex-col">
        <label className="text-lg font-semibold text-gray-700">Sitio Web</label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          className="mt-2 p-2 border rounded-md shadow-lg"
          placeholder="https://www.tusitio.com"
        />
      </div>

      {/* Redes sociales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {["instagram", "facebook", "youtube", "x", "transfermarkt"].map(
          (platform) => (
            <div key={platform} className="flex flex-col">
              <label className="text-lg font-semibold text-gray-700">
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </label>
              <input
                type="url"
                name={platform}
                value={
                  formData.socialMedia[
                    platform as keyof typeof formData.socialMedia
                  ]
                }
                onChange={handleInputChange}
                className="mt-2 p-2 border rounded-md shadow-lg"
                placeholder={`https://www.${platform}.com/tuperfil`}
              />
            </div>
          )
        )}
      </div>

      {/* Tipo de Organización */}
      <div className="flex flex-col">
        <label className="text-lg font-semibold text-gray-700">
          Tipo de Organización
        </label>
        <select
          name="organizationType"
          value={formData.organizationType}
          onChange={handleInputChange}
          className="mt-2 p-2 border rounded-md shadow-lg"
          required
        >
          <option value="">Selecciona un tipo</option>
          <option value="professionalClub">Club Profesional</option>
          <option value="amateurClub">Club Amateur</option>
          <option value="recruitmentAgency">Agencia de Reclutamiento</option>
          <option value="footballSchool">Escuela de Fútbol</option>
        </select>
      </div>

      {/* Botón de envío */}
      <button
        type="submit"
        className="w-full py-3 mt-6 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
      >
        Guardar perfil
      </button>
    </form>
  );
}

export default AgencyForm;
