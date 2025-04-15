import React from "react";
import Image from "next/image";
import { ICurso } from "@/Interfaces/ICursos";

const CardCurso: React.FC<{ curso: ICurso }> = ({ curso }) => {
  return (
    <section className="max-w-4xl mx-auto mt-24 bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Imagen superior del curso */}
      <div className="relative h-72 w-full">
        <Image
          src={curso.image}
          alt={curso.title}
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
        />
      </div>

      {/* Contenido del curso */}
      <div className="p-8 space-y-4">
        <h1 className="text-3xl font-extrabold text-gray-900">{curso.title}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <p><strong>Categoría:</strong> {curso.category}</p>
          <p><strong>Idioma:</strong> {curso.language}</p>
          <p><strong>País:</strong> {curso.country}</p>
          <p><strong>Modalidad:</strong> {curso.modality}</p>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            <strong>Contacto:</strong> <a href={`mailto:${curso.contact}`} className="text-green-700 underline">{curso.contact}</a>
          </p>
        </div>

        {/* Botón opcional para más info o inscripción */}
        <div className="mt-6">
        <p className="text-sm text-gray-600">
            <strong>{curso.description}</strong> 
          </p>
        </div>
      </div>
    </section>
  );
};

export default CardCurso;
