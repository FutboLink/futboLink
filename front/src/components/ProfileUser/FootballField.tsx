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
    Portero: { x: 50, y: 95, zone: "gk", abbr: "GK" },
    "Defensor Central": { x: 50, y: 80, zone: "defense", abbr: "CB" },
    "Lateral Derecho": { x: 80, y: 80, zone: "defense", abbr: "RB" },
    "Lateral Izquierdo": { x: 20, y: 80, zone: "defense", abbr: "LB" },
    "Mediocampista Defensivo": { x: 50, y: 65, zone: "midfield", abbr: "CDM" },
    "Mediocampista Central": { x: 50, y: 50, zone: "midfield", abbr: "CM" },
    "Mediocampista Ofensivo": { x: 50, y: 35, zone: "midfield", abbr: "CAM" },
    "Extremo Derecho": { x: 80, y: 35, zone: "attack", abbr: "RW" },
    "Extremo Izquierdo": { x: 20, y: 35, zone: "attack", abbr: "LW" },
    "Delantero Centro": { x: 50, y: 15, zone: "attack", abbr: "CF" },
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
      transform: "translate(-50%, -50%)",
      width: "clamp(28px, 3vw, 32px)",
      height: "clamp(28px, 3vw, 32px)",
      borderRadius: "50%",
      border: "2px solid",
      borderColor: isPrimary ? "#22c55e" : isSecondary ? "#3b82f6" : "#6b7280",
      backgroundColor: isPrimary
        ? "#f0fdf4"
        : isSecondary
        ? "#93c5fd"
        : "#f3f4f6",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      color: isPrimary ? "#7f1d1d" : isSecondary ? "#1e3a8a" : "#374151",
      transition: "all 0.2s ease",
      zIndex: 10,
      boxShadow:
        isPrimary || isSecondary
          ? "0 4px 8px rgba(0,0,0,0.2)"
          : "0 2px 4px rgba(0,0,0,0.1)",
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
            <div className="w-full max-w-[320px] mx-auto">
              <div
                className="relative bg-gray-100 rounded-xl p-2 w-full"
                style={{
                  aspectRatio: "2/3",
                  maxHeight: "400px",
                }}
              >
                {/* Fondo de la cancha */}
                <div
                  className="absolute inset-2 bg-green-500 border-4 border-white rounded-lg shadow-lg overflow-hidden"
                  style={{
                    backgroundImage: `
                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "15px 15px",
                  }}
                >
                  {/* Líneas del campo vertical */}
                  {/* Línea central horizontal */}
                  <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white transform -translate-y-0.5"></div>

                  {/* Círculo central */}
                  <div className="absolute left-1/2 top-1/2 w-12 h-12 sm:w-16 sm:h-16 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

                  {/* Área grande superior (portería visitante) - ahora es el área de ataque */}
                  <div className="absolute top-0 left-1/2 h-16 w-24 sm:h-20 sm:w-32 border-2 border-white border-t-0 transform -translate-x-1/2"></div>

                  {/* Área pequeña superior */}
                  <div className="absolute top-0 left-1/2 h-8 w-16 sm:h-10 sm:w-20 border-2 border-white border-t-0 transform -translate-x-1/2"></div>

                  {/* Área grande inferior (portería local) - ahora es el área defensiva */}
                  <div className="absolute bottom-0 left-1/2 h-16 w-24 sm:h-20 sm:w-32 border-2 border-white border-b-0 transform -translate-x-1/2"></div>

                  {/* Área pequeña inferior */}
                  <div className="absolute bottom-0 left-1/2 h-8 w-16 sm:h-10 sm:w-20 border-2 border-white border-b-0 transform -translate-x-1/2"></div>

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
                          className="hover:scale-110 active:scale-95 transition-transform"
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
