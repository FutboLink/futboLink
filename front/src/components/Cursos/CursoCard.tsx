import React from "react";
import { ICurso } from "@/Interfaces/ICursos";
import Image from "next/image";
import { renderCountryFlag } from "../countryFlag/countryFlag";

const CursoCard: React.FC<{
  curso: ICurso;
  handleVerCursoClick: () => void;
}> = ({ curso, handleVerCursoClick }) => {
  const country = curso.country.trim().replace(/\s/g, "");

  const languageMap: Record<string, string> = {
    Español: "ES",
    Inglés: "EN",
    Ingles: "EN",
    Italiano: "IT",
  };

  const languageCode = languageMap[curso.language] || curso.language;

  return (
    <div className="relative bg-white shadow-lg rounded-lg h-[20rem] overflow-hidden">
      <Image
        width={300}
        height={200}
        src={curso.image}
        alt={curso.title}
        className="w-full h-full object-cover rounded-md pb-[3rem]"
      />
      <div className="absolute top-0 p-4 h-full w-full flex flex-col justify-end bg-gradient-to-t from-white from-15% to-55%">
        <p className="text-gray-700 text-sm">{curso.modality}</p>
        <h2 className="text-[1.3rem] leading-[1.2] text-gray-700 font-bold">
          {curso.title}
        </h2>
        <div className="mt-2 flex justify-between items-end">
          <button
            onClick={handleVerCursoClick}
            className="px-6 py-2 bg-white font-bold text-green-800 border-2 border-green-800 rounded-md transition-color duration-300 hover:bg-green-800 hover:text-white"
          >
            Ver más
          </button>
          <div className="flex items-center gap-2">
            {renderCountryFlag(country)}{" "}
            <span className="text-gray-700 font-semibold">{languageCode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CursoCard;