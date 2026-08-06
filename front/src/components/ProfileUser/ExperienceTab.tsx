import Link from "next/link";
import { useState } from "react";
import { FaArrowRight, FaTrophy } from "react-icons/fa";
import { renderCountryFlag } from "@/components/countryFlag/countryFlag";

interface ExperienceTabProps {
  trayectorias: any[];
}

export default function ExperienceTab({
  trayectorias,
}: ExperienceTabProps) {
  const [openModal, setOpenModal] = useState<
  "countries" | "clubs" | null
>(null);

  const uniqueLeagues = trayectorias.filter(
    (league, index, self) =>
      index ===
      self.findIndex(
        (l) =>
          l.ligaPageId === league.ligaPageId &&
          l.ligaPageSlug === league.ligaPageSlug
      )
  );
const uniqueCountries = [
  ...new Set(
    trayectorias
      .map((t) => t.nacionalidadTrayectoria)
      .filter(Boolean)
  ),
];

const uniqueClubs = trayectorias.filter(
  (club, index, self) =>
    index ===
    self.findIndex(
      (c) =>
        (c.clubPageId || c.club) ===
        (club.clubPageId || club.club)
    )
);
  
  if (!uniqueLeagues.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
        <h2 className="text-xl font-bold text-gray-800">
          Experiencia
        </h2>

        <p className="mt-2 text-gray-500">
          Este jugador todavía no registró competiciones.
        </p>
      </div>
    );
  }

  return (
    <div>

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-2xl font-bold text-gray-800">
            Experiencia
          </h2>

          <p className="text-gray-500 mt-1">
            Ha competido en{" "}
            <span className="font-semibold text-[#3d7a26]">
              {uniqueLeagues.length}
            </span>{" "}
            {uniqueLeagues.length === 1
              ? "liga"
              : "ligas"}
          </p>

        </div>

        <div className="hidden md:flex px-3 py-1 rounded-full bg-[#eef7ea] text-[#3d7a26] text-sm font-semibold">

          {uniqueLeagues.length} {uniqueLeagues.length === 1 ? "liga" : "ligas"}

        </div>

      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">

  <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">

    <div className="text-2xl font-bold text-[#3d7a26]">
      {uniqueLeagues.length}
    </div>

    <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
      Ligas
    </div>

  </div>

 <button
  onClick={() => setOpenModal("countries")}
  className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow-md transition-all duration-200"
>

  <div className="text-2xl font-bold text-[#3d7a26]">
    {uniqueCountries.length}
  </div>

  <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
    Países
  </div>

</button>

<button
  onClick={() => setOpenModal("clubs")}
  className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow-md transition-all duration-200"
>

  <div className="text-2xl font-bold text-[#3d7a26]">
    {uniqueClubs.length}
  </div>

  <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
    Clubes
  </div>

</button>

</div>

      <div className="space-y-3">

        {uniqueLeagues.map((liga, index) => (

          <Link
            key={liga.ligaPageId || index}
            href={`/pages/${liga.ligaPageSlug}`}
            className="group block"
          >

            <article className="rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 p-4">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 shrink-0 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">

                    {liga.ligaPageLogo ? (

                      <img
                        src={liga.ligaPageLogo}
                        alt={liga.liga}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />

                    ) : (

                      <FaTrophy
                        className="text-gray-400"
                        size={20}
                      />

                    )}

                  </div>

                  <div>

                    <h3 className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">

                      {liga.liga}

                    </h3>

                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">

                      {liga.nacionalidadTrayectoria &&
                        renderCountryFlag(
                          liga.nacionalidadTrayectoria
                        )}

                      <span>
                        {liga.nacionalidadTrayectoria}
                      </span>

                    </div>

                    <p className="mt-1 text-xs text-gray-500">

                      Competición oficial

                    </p>

                  </div>

                </div>

                <FaArrowRight
                  size={15}
                  className="text-gray-400 transition-all duration-300 group-hover:text-[#3d7a26] group-hover:translate-x-1"
                />

              </div>

            </article>

          </Link>

        ))}

      </div>
      {openModal && (
  <>
    <div
      className="fixed inset-0 bg-black/40 z-40"
      onClick={() => setOpenModal(null)}
    />

    <div
      className="
fixed
bottom-0
left-0
right-0
z-50
bg-white
rounded-t-[28px]
p-6
max-h-[70vh]
overflow-y-auto
shadow-2xl
"
    >

      <div className="w-12 h-1.5 rounded-full bg-gray-300 mx-auto mb-5" />

      <h3 className="text-xl font-bold mb-5">

        {openModal === "countries"
          ? "Países"
          : "Clubes"}

      </h3>

    </div>

  </>
)}

    </div>
  );
}
