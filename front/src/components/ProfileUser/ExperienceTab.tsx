import Image from "next/image";
import { renderCountryFlag } from "@/components/countryFlag/countryFlag";

interface ExperienceTabProps {
  trayectorias: any[];
}

export default function ExperienceTab({
  trayectorias,
}: ExperienceTabProps) {
  // Eliminar ligas repetidas
  const uniqueLeagues = trayectorias.filter(
    (trayectoria, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.ligaPageId === trayectoria.ligaPageId ||
          t.liga === trayectoria.liga
      )
  );

  if (!uniqueLeagues.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Experiencia
        </h3>

        <p className="text-gray-500">
          Este jugador todavía no registró ligas.
        </p>
      </div>
    );
  }

  return (
    <div>

      <h3 className="text-xl font-bold text-gray-800 mb-6">
        Experiencia
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        {uniqueLeagues.map((liga, index) => (

          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex flex-col items-center text-center"
          >

            {liga.ligaPageLogo ? (
              <img
                src={liga.ligaPageLogo}
                alt={liga.liga}
                className="w-20 h-20 object-contain mb-5"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 mb-5" />
            )}

            <h4 className="text-lg font-bold text-gray-800">
              {liga.liga}
            </h4>

            <div className="flex items-center gap-2 mt-3 text-gray-500">

              {liga.nacionalidadTrayectoria &&
                renderCountryFlag(liga.nacionalidadTrayectoria)}

              <span>
                {liga.nacionalidadTrayectoria}
              </span>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
