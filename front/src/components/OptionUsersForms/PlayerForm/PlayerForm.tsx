/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import Image from "next/image";

function PlayerForm() {
  const [formData, setFormData] = useState({
    profilePicture: "",
    role: "",
    name: "",
    lastName: "",
    phone: "",
    nationality: "",
    currentLocation: "",
    email: "",
    cv: null,
    extraDocument: null,
    introVideo: "",
    gender: "",
    birthDate: "",
    transfermarkt: "",
    instagram: "",
    facebook: "",
    twitter: "",
    youtubeChannel: "",
    whatsapp: "",
    weight: "",
    height: "",
    foot: "",
    bodyType: "",
    galleryPhotos: [],
    galleryVideos: [],
    skills: {
      goalkeeper: "",
      defender: "",
      midfielder: "",
      forward: "",
      leadership: "",
      motivation: "",
      communication: "",
      digitalTools: "",
      dataAnalysis: "",
      psychology: "",
      fitnessCoach: "",
      goalkeeperCoach: "",
      trainer: "",
      sportsNutrition: "",
      preventiveCare: "",
      injuryRehabilitation: "",
      firstAid: "",
      massageTherapies: "",
    },
    countries: [],
    languages: [],
    experience: [],
    education: [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData({ ...formData, [field]: file });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit form logic here
  };

  return (
    <div className="container text-black mt-24 mx-auto px-4 py-12">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Datos Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Foto de perfil
            </label>
            <input
              type="file"
              name="profilePicture"
              onChange={(e) => handleFileChange(e, "profilePicture")}
              className="mt-2 p-2 border rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">Rol</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
            >
              <option value="">Selecciona un rol</option>
              <option value="player">Jugador</option>
              <option value="coach">Entrenador</option>
              <option value="physio">Fisioterapeuta</option>
              <option value="psychologist">Psicólogo</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
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
              className="mt-2 p-2 border rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Teléfono
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Nacionalidad
            </label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Ubicación actual
            </label>
            <input
              type="text"
              name="currentLocation"
              value={formData.currentLocation}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">Gmail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">CV</label>
            <input
              type="file"
              name="cv"
              onChange={(e) => handleFileChange(e, "cv")}
              className="mt-2 p-2 border rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Documento Extra
            </label>
            <input
              type="file"
              name="extraDocument"
              onChange={(e) => handleFileChange(e, "extraDocument")}
              className="mt-2 p-2 border rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Video de presentación
            </label>
            <input
              type="url"
              name="introVideo"
              value={formData.introVideo}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
              placeholder="Link de YouTube"
            />
          </div>
        </div>

        {/* Información sobre el jugador */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Género
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
            >
              <option value="">Selecciona un género</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Transfermarkt
            </label>
            <input
              type="url"
              name="transfermarkt"
              value={formData.transfermarkt}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
              placeholder="Link de Transfermarkt"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Instagram
            </label>
            <input
              type="url"
              name="instagram"
              value={formData.instagram}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
              placeholder="Link de Instagram"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Facebook
            </label>
            <input
              type="url"
              name="facebook"
              value={formData.facebook}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
              placeholder="Link de Facebook"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Twitter
            </label>
            <input
              type="url"
              name="twitter"
              value={formData.twitter}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
              placeholder="Link de Twitter"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Canal de YouTube
            </label>
            <input
              type="url"
              name="youtubeChannel"
              value={formData.youtubeChannel}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
              placeholder="Link de YouTube"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              WhatsApp (opcional)
            </label>
            <input
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
              placeholder="Número de WhatsApp"
            />
          </div>
        </div>

        {/* Físico - Solo para jugadores */}
        {formData.role === "player" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <label className="text-lg font-semibold text-gray-700">
                Peso
              </label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="mt-2 p-2 border rounded-md"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-lg font-semibold text-gray-700">
                Altura
              </label>
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="mt-2 p-2 border rounded-md"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-lg font-semibold text-gray-700">
                Pie Hábil
              </label>
              <select
                name="foot"
                value={formData.foot}
                onChange={handleInputChange}
                className="mt-2 p-2 border rounded-md"
              >
                <option value="">Selecciona el pie hábil</option>
                <option value="right">Derecho</option>
                <option value="left">Izquierdo</option>
                <option value="both">Ambidiestro</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-lg font-semibold text-gray-700">
                Posicion
              </label>
              <select
                name="foot"
                value={formData.foot}
                onChange={handleInputChange}
                className="mt-2 p-2 border rounded-md"
              >
                <option value="">Selecciona la posicion</option>
                <option value="right">Arquero</option>
                <option value="left">Defensor</option>
                <option value="both">Mediocampista</option>
                <option value="both">Delantero</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-lg font-semibold text-gray-700">
                Estructura Corporal
              </label>
              <select
                name="bodyType"
                value={formData.bodyType}
                onChange={handleInputChange}
                className="mt-2 p-2 border rounded-md"
              >
                <option value="">Selecciona tu estructura corporal</option>
                <option value="endomorph">Endomorfo</option>
                <option value="ectomorph">Ectomorfo</option>
                <option value="mesomorph">Mesomorfo</option>
              </select>
            </div>
          </div>
        )}

        {/* Habilidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <label className="text-lg font-semibold text-gray-700">
              Habilidades
            </label>
            <input
              type="text"
              name="skills"
              value={Object.values(formData.skills).join(", ")} // Convierte el objeto en un string
              onChange={handleInputChange}
              className="mt-2 p-2 border rounded-md"
              placeholder="Elige tus habilidades"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-6 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}

export default PlayerForm;
