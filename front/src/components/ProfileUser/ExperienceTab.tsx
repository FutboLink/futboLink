import Link from "next/link";
import { useState } from "react";
import {
  FaTrophy,
  FaShieldAlt,
  FaGlobeEurope,
  FaChartBar,
} from "react-icons/fa";
import { FaArrowRight, FaTrophy } from "react-icons/fa";
import { renderCountryFlag } from "@/components/countryFlag/countryFlag";

interface ExperienceTabProps {
  trayectorias: any[];
  isPlayer: boolean;
}

export default function ExperienceTab({
  trayectorias,
  isPlayer,
}: ExperienceTabProps) {
const [activeView, setActiveView] = useState<
  "leagues" | "countries" | "clubs"
>("leagues");
  
const [showCareerModal, setShowCareerModal] = useState(false);

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

<button
  onClick={() => setActiveView("leagues")}
  className={`rounded-xl border p-4 text-center shadow-sm transition-all duration-200 ${
    activeView === "leagues"
      ? "border-[#3d7a26] bg-[#eef7ea]"
      : "border-gray-200 bg-white hover:shadow-md"
  }`}
>

  <div className="text-2xl font-bold text-[#3d7a26]">
    {uniqueLeagues.length}
  </div>

  <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
    Ligas
  </div>

</button>

<button
  onClick={() => setActiveView("countries")}
  className={`rounded-xl border p-4 text-center shadow-sm transition-all duration-200 ${
    activeView === "countries"
      ? "border-[#3d7a26] bg-[#eef7ea]"
      : "border-gray-200 bg-white hover:shadow-md"
  }`}
>

  <div className="text-2xl font-bold text-[#3d7a26]">
    {uniqueCountries.length}
  </div>

  <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
    Países
  </div>

</button>

<button
  onClick={() => setActiveView("clubs")}
  className={`rounded-xl border p-4 text-center shadow-sm transition-all duration-200 ${
  activeView === "clubs"
    ? "border-[#3d7a26] bg-[#eef7ea]"
    : "border-gray-200 bg-white hover:shadow-md"
}`}
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
        {activeView === "leagues" && (
         uniqueLeagues.map((liga, index) => (

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

                ))

             )}
        {activeView === "countries" && (

  uniqueCountries.map((country, index) => (

    <article
      key={index}
      className="rounded-xl bg-white border border-gray-200 shadow-sm p-4"
    >

      <div className="flex items-center gap-4">

        <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-2xl bg-white">

          {renderCountryFlag(country)}

        </div>

        <div>

          <h3 className="font-bold text-gray-800">

            {country}

          </h3>

          <p className="mt-1 text-xs text-gray-500">

            País donde compitió

          </p>

        </div>

      </div>

    </article>

  ))

)}
        {activeView === "clubs" && (

  uniqueClubs.map((club, index) => (

    <Link
      key={club.clubPageId || index}
      href={club.clubPageSlug ? `/pages/${club.clubPageSlug}` : "#"}
      className="group block"
    >

      <article className="rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 p-4">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 shrink-0 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">

              {club.clubPageLogo ? (

                <img
                  src={club.clubPageLogo}
                  alt={club.club}
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

                {club.club}

              </h3>

              <p className="mt-1 text-xs text-gray-500">

                Club

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

  ))

)}

       </div>
{/* Career Verified */}

{isPlayer && (
  <>
    <div className="mt-8 rounded-2xl border border-[#3d7a26]/20 bg-gradient-to-br from-[#3d7a26] to-[#2f641f] p-5 sm:p-6 text-white shadow-lg">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

        <div className="flex-1">

          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
  <FaTrophy className="text-green-100" />
</div>

            <span className="text-xs font-bold uppercase tracking-widest text-green-100">
              Career Verified by Futbolink
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
            Hacé que tu trayectoria destaque
          </h3>

          <p className="mt-2 text-sm sm:text-base text-green-50 max-w-xl">
            Presentá tus clubes, ligas y experiencia de una forma más
            profesional para destacar ante los reclutadores.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-green-50">
            <div className="flex items-center gap-2">
  <FaShieldAlt className="text-green-100" />
  <span>Clubes</span>
</div>

<div className="flex items-center gap-2">
  <FaTrophy className="text-green-100" />
  <span>Ligas</span>
</div>

<div className="flex items-center gap-2">
  <FaGlobeEurope className="text-green-100" />
  <span>Países</span>
</div>

<div className="flex items-center gap-2">
  <FaChartBar className="text-green-100" />
  <span>Estadísticas</span>
</div>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center md:items-stretch lg:items-center gap-3 md:min-w-[250px]">

          <div className="text-center sm:text-left md:text-center lg:text-left">
            <p className="text-xs text-green-100">
              Pago único
            </p>

            <p className="text-3xl font-bold">
              €7,95
            </p>
          </div>

          <div className="flex flex-col gap-2">

            <button
              type="button"
              onClick={() =>
                window.open(
                  "https://buy.stripe.com/4gM00j70fgHBfIF35Qgbm02",
                  "_blank"
                )
              }
              className="px-5 py-3 rounded-xl bg-white text-[#3d7a26] font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all whitespace-nowrap"
            >
              ✨ Mejorar mi perfil
            </button>

            <button
              type="button"
              onClick={() => setShowCareerModal(true)}
              className="px-5 py-2.5 rounded-xl border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-all"
            >
              Ver ejemplo
            </button>

          </div>

        </div>

      </div>

      <p className="mt-4 text-[11px] text-green-100/80">
        Incluye enlaces a las páginas oficiales de clubes y ligas.
      </p>

    </div>

    {/* Modal */}

    {showCareerModal && (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
        onClick={() => setShowCareerModal(false)}
      >

        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >

          <button
            type="button"
            onClick={() => setShowCareerModal(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-xl font-bold text-gray-700 shadow-md hover:bg-gray-100 transition"
            aria-label="Cerrar"
          >
            ×
          </button>

          <div className="p-5 sm:p-7">

            <div className="text-center mb-5">

              <p className="text-xs font-bold uppercase tracking-widest text-[#3d7a26]">
                Career Verified by Futbolink
              </p>

              <h3 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">
                Así puede verse tu perfil
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Una presentación más profesional de tu trayectoria para
                destacar tu experiencia ante los reclutadores.
              </p>

            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-2 sm:p-3">
              <img
                src="/career-verified-example.png"
                alt="Ejemplo de perfil Career Verified de Futbolink"
                className="w-full h-auto rounded-lg shadow-sm"
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-5">

              <div className="text-center sm:text-left">

                <p className="text-sm text-gray-500">
                  Career Verified
                </p>

                <p className="text-2xl font-bold text-gray-900">
                  €7,95
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    · Pago único
                  </span>
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  window.open(
                    "https://buy.stripe.com/4gM00j70fgHBfIF35Qgbm02",
                    "_blank"
                  )
                }
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#3d7a26] text-white font-bold shadow-md hover:bg-[#326520] hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                ✨ Mejorar mi perfil
              </button>

            </div>

            <p className="mt-3 text-center text-xs text-gray-400">
              Incluye enlaces a las páginas oficiales de clubes y ligas.
            </p>

          </div>

        </div>

      </div>
    )}

  </>
)}

  </div>
  );
}
