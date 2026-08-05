import Link from "next/link";
import { FaArrowRight, FaTrophy } from "react-icons/fa";
import { renderCountryFlag } from "@/components/countryFlag/countryFlag";

interface ExperienceTabProps {
  trayectorias: any[];
}

export default function ExperienceTab({
  trayectorias,
}: ExperienceTabProps) {

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

      <div className="mb-7">

        <h2 className="text-2xl font-bold text-gray-800">
          Experiencia
        </h2>

        <p className="text-gray-500 mt-1">
          {uniqueLeagues.length}{" "}
          {uniqueLeagues.length === 1
            ? "competición registrada"
            : "competiciones registradas"}
        </p>

      </div>

      <div className="space-y-4">

        {uniqueLeagues.map((liga, index) => (

          <Link
            key={liga.ligaPageId || index}
            href={`/pages/${liga.ligaPageSlug}`}
            className="group block"
          >

            <div className="bg-white border border-[#dbead4] rounded-2xl shadow-sm hover:shadow-lg hover:border-[#3d7a26] transition-all duration-300 p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-5">

                  <div className="w-20 h-20 rounded-xl border border-[#dbead4] bg-white flex items-center justify-center overflow-hidden">

                    {liga.ligaPageLogo ? (
                      <img
                        src={liga.ligaPageLogo}
                        alt={liga.liga}
                        className="w-16 h-16 object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <FaTrophy
                        className="text-[#3d7a26]"
                        size={30}
                      />
                    )}

                  </div>

                  <div>

                    <h3 className="text-2xl font-bold text-[#1f4d25] group-hover:text-[#3d7a26] transition-colors">

                      {liga.liga}

                    </h3>

                    <div className="flex items-center gap-2 mt-2 text-gray-600">

                      {liga.nacionalidadTrayectoria &&
                        renderCountryFlag(
                          liga.nacionalidadTrayectoria
                        )}

                      <span>
                        {liga.nacionalidadTrayectoria}
                      </span>

                    </div>

                  </div>

                </div>

                <div className="hidden md:flex items-center gap-2 text-[#3d7a26] font-semibold group-hover:gap-3 transition-all">

                  Ver competición

                  <FaArrowRight size={13} />

                </div>

              </div>

            </div>

          </Link>

        ))}

      </div>

    </div>
  );
}
