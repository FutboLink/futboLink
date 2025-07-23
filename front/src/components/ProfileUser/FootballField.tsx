"use client";
import React from 'react';

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
  onSecondaryPositionChange
}) => {
  const [selectionMode, setSelectionMode] = React.useState<'primary' | 'secondary'>('primary');

  // Definir las posiciones con sus coordenadas (porcentajes)
  const positions = {
    'Portero': { x: 5, y: 50, zone: 'gk' },
    'Defensor Central': { x: 20, y: 50, zone: 'defense' },
    'Lateral Derecho': { x: 20, y: 20, zone: 'defense' },
    'Lateral Izquierdo': { x: 20, y: 80, zone: 'defense' },
    'Mediocampista Defensivo': { x: 35, y: 50, zone: 'midfield' },
    'Mediocampista Central': { x: 50, y: 50, zone: 'midfield' },
    'Mediocampista Ofensivo': { x: 65, y: 50, zone: 'midfield' },
    'Extremo Derecho': { x: 65, y: 20, zone: 'attack' },
    'Extremo Izquierdo': { x: 65, y: 80, zone: 'attack' },
    'Delantero Centro': { x: 85, y: 50, zone: 'attack' }
  };

  const handlePositionClick = (position: string) => {
    if (selectionMode === 'primary') {
      onPrimaryPositionChange(position);
    } else {
      onSecondaryPositionChange(position);
    }
  };

  const getPositionStyle = (position: string) => {
    const pos = positions[position as keyof typeof positions];
    if (!pos) return {};

    const isPrimary = primaryPosition === position;
    const isSecondary = secondaryPosition === position;
    
    return {
      position: 'absolute' as const,
      left: `${pos.x}%`,
      top: `${pos.y}%`,
      transform: 'translate(-50%, -50%)',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      border: '3px solid',
      borderColor: isPrimary ? '#ef4444' : isSecondary ? '#3b82f6' : '#6b7280',
      backgroundColor: isPrimary ? '#fca5a5' : isSecondary ? '#93c5fd' : '#f3f4f6',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: 'bold',
      color: isPrimary ? '#7f1d1d' : isSecondary ? '#1e3a8a' : '#374151',
      transition: 'all 0.2s ease',
      zIndex: 10,
      boxShadow: isPrimary || isSecondary ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-3 text-gray-800">Selecciona tus posiciones en el campo</h3>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            onClick={() => setSelectionMode('primary')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex-1 sm:flex-none ${
              selectionMode === 'primary'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🎯 Posición Principal
          </button>
          <button
            onClick={() => setSelectionMode('secondary')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex-1 sm:flex-none ${
              selectionMode === 'secondary'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ⭐ Posición Secundaria
          </button>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-700 mb-1 flex items-center">
            <span className="inline-block w-4 h-4 bg-red-300 border-2 border-red-500 rounded-full mr-2"></span>
            <strong>Principal:</strong> <span className="ml-1 text-red-600">{primaryPosition || 'No seleccionada'}</span>
          </div>
          <div className="text-sm text-gray-700 flex items-center">
            <span className="inline-block w-4 h-4 bg-blue-300 border-2 border-blue-500 rounded-full mr-2"></span>
            <strong>Secundaria:</strong> <span className="ml-1 text-blue-600">{secondaryPosition || 'No seleccionada'}</span>
          </div>
        </div>
      </div>

      {/* Cancha de fútbol */}
      <div className="relative w-full bg-gray-100 rounded-xl p-2" style={{ paddingBottom: '62%' }}>
        {/* Fondo de la cancha */}
        <div 
          className="absolute inset-2 bg-green-400 border-4 border-white rounded-lg shadow-lg overflow-hidden"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        >
          {/* Líneas del campo */}
          {/* Línea central */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white transform -translate-x-0.5"></div>
          
          {/* Círculo central */}
          <div className="absolute left-1/2 top-1/2 w-16 h-16 sm:w-20 sm:h-20 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Área grande izquierda */}
          <div className="absolute left-0 top-1/2 w-12 h-24 sm:w-16 sm:h-32 border-2 border-white border-l-0 transform -translate-y-1/2"></div>
          
          {/* Área pequeña izquierda */}
          <div className="absolute left-0 top-1/2 w-6 h-16 sm:w-8 sm:h-20 border-2 border-white border-l-0 transform -translate-y-1/2"></div>
          
          {/* Área grande derecha */}
          <div className="absolute right-0 top-1/2 w-12 h-24 sm:w-16 sm:h-32 border-2 border-white border-r-0 transform -translate-y-1/2"></div>
          
          {/* Área pequeña derecha */}
          <div className="absolute right-0 top-1/2 w-6 h-16 sm:w-8 sm:h-20 border-2 border-white border-r-0 transform -translate-y-1/2"></div>
          
          {/* Arcos */}
          <div className="absolute left-0 top-1/2 w-1 h-8 sm:w-2 sm:h-12 bg-white transform -translate-y-1/2"></div>
          <div className="absolute right-0 top-1/2 w-1 h-8 sm:w-2 sm:h-12 bg-white transform -translate-y-1/2"></div>

          {/* Posiciones clickeables */}
          {Object.entries(positions).map(([positionName, positionData]) => (
            <div
              key={positionName}
              style={getPositionStyle(positionName)}
              onClick={() => handlePositionClick(positionName)}
              title={positionName}
              className="hover:scale-110 transition-transform"
            >
              {positionName === 'Portero' && '🥅'}
              {positionName.includes('Defensor') && '🛡️'}
              {positionName.includes('Lateral') && '🏃'}
              {positionName.includes('Mediocampista') && '⚽'}
              {positionName.includes('Extremo') && '💨'}
              {positionName.includes('Delantero') && '🎯'}
            </div>
          ))}

          {/* Zonas de selección más grandes (invisibles) para mejor UX */}
          {Object.entries(positions).map(([positionName, positionData]) => (
            <div
              key={`zone-${positionName}`}
              className="absolute cursor-pointer hover:bg-white hover:bg-opacity-10 transition-colors rounded-full"
              style={{
                left: `${positionData.x}%`,
                top: `${positionData.y}%`,
                transform: 'translate(-50%, -50%)',
                width: '50px',
                height: '50px',
                zIndex: 5
              }}
              onClick={() => handlePositionClick(positionName)}
              title={positionName}
            />
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 text-xs">
        {Object.entries(positions).map(([positionName]) => (
          <div
            key={positionName}
            className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors border"
            onClick={() => handlePositionClick(positionName)}
          >
            <div
              className="w-4 h-4 rounded-full border-2 flex-shrink-0"
              style={{
                borderColor: primaryPosition === positionName ? '#ef4444' : 
                           secondaryPosition === positionName ? '#3b82f6' : '#6b7280',
                backgroundColor: primaryPosition === positionName ? '#fca5a5' : 
                               secondaryPosition === positionName ? '#93c5fd' : '#f3f4f6'
              }}
            />
            <span className="text-gray-700 text-xs sm:text-sm">{positionName}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          💡 <strong>Instrucciones:</strong> Selecciona primero si quieres configurar la posición Principal (🎯) o Secundaria (⭐), 
          luego haz clic en la posición deseada en el campo o en la lista de abajo.
        </p>
      </div>
    </div>
  );
};

export default FootballField; 