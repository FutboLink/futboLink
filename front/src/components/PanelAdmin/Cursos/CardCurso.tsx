import React from "react";
import Image from "next/image";
import { ICurso } from "@/Interfaces/ICursos";

const CardCurso: React.FC<{ curso: ICurso }> = ({ curso }) => {
  return (
    <section className="max-w-4xl mx-auto mt-24 p-6 bg-white shadow-md rounded-lg">
      {/* Imagen del curso */}
      <div className="w-full h-96 relative mb-6">
        <Image
          src={curso.image}
          alt={curso.title}
          layout="fill"
          objectFit="contain" // Ajusta la imagen sin recortarla
          className="rounded-lg"
        />
      </div>

      {/* Título del curso */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{curso.title}</h1>

      {/* Categoría y otros detalles */}
      <p className="text-gray-700 text-base mb-2">
        <strong>Categoría:</strong> {curso.category}
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>País:</strong> {curso.country}
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>Idioma:</strong> {curso.language}
      </p>
      <p className="text-gray-700 text-base mb-2">
        <strong>Modalidad:</strong> {curso.modality}
      </p>
      <p className="text-gray-700 text-base mb-4">
        <strong>Contacto:</strong> {curso.contact}
      </p>
    </section>
  );
};

export default CardCurso;
