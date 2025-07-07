import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../Context/UserContext';
import { IProfileData } from '@/Interfaces/IUser';
import Image from 'next/image';
import { getDefaultPlayerImage } from '@/helpers/imageUtils';
import { renderCountryFlag } from '../countryFlag/countryFlag';
import { toast } from 'react-toastify';

interface RecruiterApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

interface PortfolioPlayer extends IProfileData {
  selected?: boolean;
}

const RecruiterApplicationModal: React.FC<RecruiterApplicationModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle
}) => {
  const { user, token } = useContext(UserContext);
  const [portfolioPlayers, setPortfolioPlayers] = useState<PortfolioPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recruiterMessage, setRecruiterMessage] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  // Obtener la URL de la API
  const getApiUrl = () => {
    return process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : process.env.NEXT_PUBLIC_API_URL;
  };

  // Cargar jugadores de la cartera
  useEffect(() => {
    if (!isOpen || !user || !token) return;

    const fetchPortfolioPlayers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${getApiUrl()}/user/${user.id}/portfolio`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const players = await response.json();
          setPortfolioPlayers(players);
        } else {
          toast.error('Error al cargar la cartera de jugadores');
        }
      } catch (error) {
        console.error('Error al cargar cartera:', error);
        toast.error('Error al cargar la cartera de jugadores');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioPlayers();
  }, [isOpen, user, token]);

  // Manejar selección de jugadores
  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  // Seleccionar todos los jugadores
  const selectAllPlayers = () => {
    if (selectedPlayers.length === portfolioPlayers.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(portfolioPlayers.map(player => player.id!));
    }
  };

  // Enviar aplicaciones
  const handleSubmitApplications = async () => {
    if (selectedPlayers.length === 0) {
      toast.error('Selecciona al menos un jugador');
      return;
    }

    if (!recruiterMessage.trim()) {
      toast.error('Escribe un mensaje explicando por qué postulas a estos jugadores');
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Enviar aplicación para cada jugador seleccionado
      for (const playerId of selectedPlayers) {
        try {
          const response = await fetch(`${getApiUrl()}/applications/recruiter-apply`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              playerId,
              jobId,
              message: recruiterMessage,
              playerMessage: `Mi representante me ha postulado a esta oferta: "${jobTitle}"`
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            const error = await response.json();
            console.error(`Error al postular jugador ${playerId}:`, error);
            errorCount++;
          }
        } catch (error) {
          console.error(`Error al postular jugador ${playerId}:`, error);
          errorCount++;
        }
      }

      // Mostrar resultados
      if (successCount > 0) {
        toast.success(`${successCount} jugador(es) postulado(s) exitosamente`);
      }
      if (errorCount > 0) {
        toast.error(`Error al postular ${errorCount} jugador(es)`);
      }

      // Cerrar modal si al menos una aplicación fue exitosa
      if (successCount > 0) {
        onClose();
        setSelectedPlayers([]);
        setRecruiterMessage('');
      }

    } catch (error) {
      console.error('Error general al enviar aplicaciones:', error);
      toast.error('Error al enviar las aplicaciones');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Postular jugadores a: {jobTitle}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col h-full max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p>Cargando cartera de jugadores...</p>
              </div>
            </div>
          ) : portfolioPlayers.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">No tienes jugadores en tu cartera</p>
                <p className="text-sm">Añade jugadores a tu cartera desde la búsqueda de jugadores</p>
              </div>
            </div>
          ) : (
            <>
              {/* Message input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje del reclutador *
                </label>
                <textarea
                  value={recruiterMessage}
                  onChange={(e) => setRecruiterMessage(e.target.value)}
                  placeholder="Explica por qué estos jugadores son ideales para esta oferta..."
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={3}
                  required
                />
              </div>

              {/* Selection controls */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={selectAllPlayers}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  {selectedPlayers.length === portfolioPlayers.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
                <span className="text-sm text-gray-600">
                  {selectedPlayers.length} de {portfolioPlayers.length} seleccionados
                </span>
              </div>

              {/* Players grid */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioPlayers.map((player) => {
                    const isSelected = selectedPlayers.includes(player.id!);
                    return (
                      <div
                        key={player.id}
                        onClick={() => togglePlayerSelection(player.id!)}
                        className={`relative cursor-pointer border-2 rounded-lg p-4 transition-all ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {/* Selection indicator */}
                        <div className="absolute top-2 right-2">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-purple-500 border-purple-500' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <span className="text-white text-xs">✓</span>}
                          </div>
                        </div>

                        {/* Player info */}
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-3">
                            <Image
                              src={player.imgUrl || getDefaultPlayerImage(player.genre)}
                              alt={`${player.name} ${player.lastname}`}
                              width={60}
                              height={60}
                              className="rounded-full object-cover"
                            />
                            {/* Subscription badge */}
                            <div className={`absolute -bottom-1 -right-1 text-xs px-1.5 py-0.5 rounded-full text-white ${
                              player.subscriptionType === 'Profesional' ? 'bg-green-600' :
                              player.subscriptionType === 'Semiprofesional' ? 'bg-blue-600' : 'bg-gray-500'
                            }`}>
                              {player.subscriptionType === 'Profesional' ? 'PRO' :
                               player.subscriptionType === 'Semiprofesional' ? 'SEMI' : 'AM'}
                            </div>
                          </div>
                          
                          <h3 className="font-medium text-sm mb-1">
                            {player.name} {player.lastname}
                          </h3>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center justify-center gap-1">
                              {player.nationality && renderCountryFlag(player.nationality)}
                              <span>{player.nationality}</span>
                            </div>
                            
                            {player.primaryPosition && (
                              <p className="text-purple-600 font-medium">{player.primaryPosition}</p>
                            )}
                            
                            {player.age && (
                              <p>{player.age} años</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer with actions */}
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitApplications}
                  disabled={selectedPlayers.length === 0 || !recruiterMessage.trim() || submitting}
                  className={`px-6 py-2 rounded-md text-white font-medium ${
                    selectedPlayers.length > 0 && recruiterMessage.trim() && !submitting
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </span>
                  ) : (
                    `Postular ${selectedPlayers.length} jugador${selectedPlayers.length !== 1 ? 'es' : ''}`
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterApplicationModal; 