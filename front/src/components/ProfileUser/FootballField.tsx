"use client";
import React from "react";

interface FootballFieldProps {
  primaryPosition?: string;
  secondaryPosition?: string;
  onPrimaryPositionChange: (position: string) => void;
  onSecondaryPositionChange: (position: string) => void;
}

const FootballField: React.FC<FootballFieldProps> = ({
  primaryPosition,
  secondaryPosition,
  onPrimaryPositionChange,
  onSecondaryPositionChange,
}) => {
  const [selectionMode, setSelectionMode] = React.useState<
    "primary" | "secondary"
  >("primary");

  // Definir las posiciones con sus coordenadas
  const positions = {
    Portero: { x: 50, y: 95, zone: "gk", abbr: "PT" }, // Portero
    "Defensor Central Izquierdo": {
      x: 35,
      y: 80,
      zone: "defense",
      abbr: "DCI",
    },
    "Defensor Central Derecho": { x: 65, y: 80, zone: "defense", abbr: "DCD" },
    "Lateral Derecho": { x: 85, y: 80, zone: "defense", abbr: "LD" },
    "Lateral Izquierdo": { x: 15, y: 80, zone: "defense", abbr: "LI" },
    "Mediocampista Defensivo": { x: 50, y: 65, zone: "midfield", abbr: "MCD" },
    "Mediocampista Izquierdo": { x: 35, y: 50, zone: "midfield", abbr: "MI" },
    "Mediocampista Central": { x: 50, y: 50, zone: "midfield", abbr: "MC" },
    "Mediocampista Derecho": { x: 65, y: 50, zone: "midfield", abbr: "MD" },
    "Mediocampista Ofensivo": { x: 50, y: 35, zone: "midfield", abbr: "MCO" },
    "Extremo Derecho": { x: 85, y: 35, zone: "attack", abbr: "ED" },
    "Extremo Izquierdo": { x: 15, y: 35, zone: "attack", abbr: "EI" },
    "Delantero Centro": { x: 50, y: 15, zone: "attack", abbr: "DC" },
  };

  const handlePositionClick = (position: string) => {
    if (selectionMode === "primary") {
      onPrimaryPositionChange(position);
    } else {
      onSecondaryPositionChange(position);
    }

    // Feedback táctil para móviles
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(5);
    }
  };

  const getPositionStyle = (position: string) => {
    const pos = positions[position as keyof typeof positions];
    if (!pos) return {};

    const isPrimary = primaryPosition === position;
    const isSecondary = secondaryPosition === position;

    return {
      position: "absolute" as const,
      left: `${pos.x}%`,
      top: `${pos.y}%`,
      transform:
          isPrimary || isSecondary
          ? "translate(-50%, -55%) scale(1.15)"
          : "translate(-50%, -50%) scale(1)",
      width: "clamp(40px, 4.5vw, 46px)",
      height: "clamp(40px, 4.5vw, 46px)",
      borderRadius: "50%",
      border: "3px solid white",
      outline: "2px solid rgba(0,0,0,.08)",
      borderColor: isPrimary ? "#22c55e" : isSecondary ? "#3b82f6" : "#6b7280",
      backgroundColor: isPrimary
          ? "#22c55e"
          : isSecondary
          ? "#3b82f6"
          : "#f3f4f6",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      color: isPrimary
         ? "#ffffff"
         : isSecondary
         ? "#ffffff"
         : "#374151",
      transition: "all .25s cubic-bezier(.2,.8,.2,1)",
      zIndex: isPrimary || isSecondary ? 30 : 10,
      boxShadow: isPrimary
         ? "0 10px 22px rgba(34,197,94,.45)"
         : isSecondary
         ? "0 10px 22px rgba(59,130,246,.45)"
         : "0 2px 5px rgba(0,0,0,.15)",
      fontSize: "clamp(10px, 1.5vw, 12px)",
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto sm:px-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-3 text-gray-800 text-center sm:text-left">
          Selecciona tus posiciones en el campo
        </h3>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Controles de selección */}
          <div className="flex-1">
            <div className="flex flex-col gap-3 mb-4">
              <button
                onClick={() => setSelectionMode("primary")}
                className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  selectionMode === "primary"
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>Posición Principal</span>
              </button>
              <button
                onClick={() => setSelectionMode("secondary")}
                className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  selectionMode === "secondary"
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>Posición Secundaria</span>
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <div className="flex items-center">
                  <span className="w-4 h-4 bg-green-300 border-2 border-green-500 rounded-full mr-3"></span>
                  <span className="font-medium text-black sm:font-thin">
                    Principal:
                  </span>
                </div>
                <span className="text-green-600 font-medium sm:font-thin">
                  {primaryPosition || "No seleccionada"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <span className="w-4 h-4 bg-blue-300 border-2 border-blue-500 rounded-full mr-3"></span>
                  <span className="font-medium text-black sm:font-thin">
                    Secundaria:
                  </span>
                </div>
                <span className="text-blue-600 font-medium sm:font-thin">
                  {secondaryPosition || "No seleccionada"}
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                💡 <strong>Instrucciones:</strong>
                <br />
                Primero selecciona el tipo de posición, luego toca la posición
                en el campo o en la lista de abajo.`
              </p>
            </div>
          </div>

          {/* Cancha de fútbol - Contenedor responsivo */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full max-w-[380px] mx-auto">
              <div
                className="relative bg-white rounded-2xl border border-gray-200 shadow-md p-3 w-full h-[520px] lg:h-[620px]"
              >
                {/* Fondo de la cancha */}
                <div
  className="absolute inset-2 border-[3px] border-white rounded-xl overflow-hidden shadow-inner"
 style={{
  backgroundImage: `
    linear-gradient(180deg, #3dbb5a 0%, #2d9444 100%),
    linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)
  `,
  backgroundSize: `
    100% 100%,
    18px 18px,
    18px 18px
  `,
}}
>
                  {/* Líneas del campo vertical */}
                  {/* Línea central horizontal */}
                  <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white transform -translate-y-0.5"></div>

                  {/* Círculo central */}
                  <div className="absolute left-1/2 top-1/2 w-12 h-12 sm:w-16 sm:h-16 border-[1.5px] border-white/90 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

                  {/* Área grande superior (portería visitante) - ahora es el área de ataque */}
                  <div className="absolute top-0 left-1/2 h-16 w-24 sm:h-20 sm:w-32 border-[1.5px] border-white/90 border-t-0 transform -translate-x-1/2"></div>

                  {/* Área pequeña superior */}
                  <div className="absolute top-0 left-1/2 h-8 w-16 sm:h-10 sm:w-20 border-[1.5px] border-white/90 border-t-0 transform -translate-x-1/2"></div>

                  {/* Área grande inferior (portería local) - ahora es el área defensiva */}
                  <div className="absolute bottom-0 left-1/2 h-16 w-24 sm:h-20 sm:w-32 border-[1.5px] border-white/90 border-b-0 transform -translate-x-1/2"></div>

                  {/* Área pequeña inferior */}
                  <div className="absolute bottom-0 left-1/2 h-8 w-16 sm:h-10 sm:w-20 border-[1.5px] border-white/90 border-b-0 transform -translate-x-1/2"></div>

                  {/* Arcos */}
                  <div className="absolute top-0 left-1/2 h-1 w-8 sm:h-2 sm:w-12 bg-white transform -translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-1/2 h-1 w-8 sm:h-2 sm:w-12 bg-white transform -translate-x-1/2"></div>

                  {/* Posiciones clickeables */}
                  {Object.entries(positions).map(
                    ([positionName, positionData]) => (
                      <React.Fragment key={positionName}>
                        <div
  style={getPositionStyle(positionName)}
  onClick={() => handlePositionClick(positionName)}
  title={positionName}
  className="group"
>
  {positionData.abbr}
</div>
                        {/* Zona de toque ampliada para móviles */}
                        <div
                          className="absolute cursor-pointer rounded-full sm:hidden"
                          style={{
                            left: `${positionData.x}%`,
                            top: `${positionData.y}%`,
                            transform: "translate(-50%, -50%)",
                            width: "40px",
                            height: "40px",
                            zIndex: 5,
                          }}
                          onClick={() => handlePositionClick(positionName)}
                          title={positionName}
                        />
                      </React.Fragment>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leyenda de posiciones en GRID (2 columnas móvil, 3 desktop) */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-700 mb-2 text-center sm:text-left">
          Seleccionar por nombre:
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.keys(positions).map((positionName) => {
            const isPrimary = primaryPosition === positionName;
            const isSecondary = secondaryPosition === positionName;
            const posData = positions[positionName as keyof typeof positions];

            return (
              <div
                key={positionName}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors border ${
                  isPrimary
                    ? "bg-green-100 border-green-500"
                    : isSecondary
                    ? "bg-blue-100 border-blue-500"
                    : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                }`}
                onClick={() => handlePositionClick(positionName)}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{
                    borderColor: isPrimary
                      ? "#ef4444"
                      : isSecondary
                      ? "#3b82f6"
                      : "#6b7280",
                    backgroundColor: isPrimary
                      ? "#fca5a5"
                      : isSecondary
                      ? "#93c5fd"
                      : "#f3f4f6",
                    color: isPrimary
                      ? "#7f1d1d"
                      : isSecondary
                      ? "#1e3a8a"
                      : "#374151",
                  }}
                ></div>
                <span className="text-xs text-gray-700">{positionName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FootballField;
