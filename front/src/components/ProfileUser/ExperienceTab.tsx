import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { renderCountryFlag } from "@/components/countryFlag/countryFlag";

interface ExperienceTabProps {
  trayectorias: any[];
}

export default function ExperienceTab({
  trayectorias,
}: ExperienceTabProps) {

  // Eliminar ligas duplicadas
  const uniqueLeagues = trayectorias.filter(
    (league, index, self) =>
      index ===
      self.findIndex(
        (l) =>
          l.ligaPageId === league.ligaPageId &&
          l.ligaPageSlug === league.ligaPageSlug
      )
  );

  if (!uniqueLeagues.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Experiencia
        </h2>

        <p className="mt-3 text-gray-500">
          Este jugador todavía no registró competiciones.
        </p>
      </div>
    );
  }

  return (
    <div>

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-gray-800">
          Experiencia
        </h2>

        <p className="text-gray-500 mt-1">
          Ha competido en{" "}
          <span className="font-semibold text-[#3d7a26]">
            {uniqueLeagues.length}
          </span>{" "}
          {uniqueLeagues.length === 1 ? "competición" : "competiciones"}
        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {uniqueLeagues.map((liga, index) => (

          <Link
            key={liga.ligaPageId || index}
            href={`/pages/${liga.ligaPageSlug}`}
            className="group bg-white rounded-2xl border border-gray-200 hover:border-[#3d7a26] hover:shadow-xl transition-all duration-300 p-7 flex flex-col items-center text-center"
          >

            {liga.ligaPageLogo ? (
              <img
                src={liga.ligaPageLogo}
                alt={liga.liga}
                className="w-24 h-24 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100" />
            )}

            <h3 className="mt-5 text-xl font-bold text-[#1f2937]">
              {liga.liga}
            </h3>

            <div className="flex items-center gap-2 mt-3 text-gray-500">

              {liga.nacionalidadTrayectoria &&
                renderCountryFlag(liga.nacionalidadTrayectoria)}

              <span>{liga.nacionalidadTrayectoria}</span>

            </div>

            <div className="mt-6 flex items-center gap-2 font-semibold text-[#3d7a26] transition-all group-hover:gap-3">

              Ver competición

              <FaArrowRight size={12} />

            </div>

          </Link>

        ))}

      </div>

    </div>
  );
}
