import Image from "next/image";
import type React from "react";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getDefaultPlayerImage } from "@/helpers/imageUtils";
import type { IProfileData } from "@/Interfaces/IUser";
import { UserContext } from "../Context/UserContext";
import { renderCountryFlag } from "../countryFlag/countryFlag";

interface RecruiterApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

interface PortfolioPlayer extends IProfileData {
  selected?: boolean;
}

interface NotificationState {
  message: string;
  isVisible: boolean;
  isError: boolean;
  playerId?: string;
}

const RecruiterApplicationModal: React.FC<RecruiterApplicationModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
}) => {
  const { user, token } = useContext(UserContext);
  const [portfolioPlayers, setPortfolioPlayers] = useState<PortfolioPlayer[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [notification, setNotification] = useState<NotificationState>({
    message: "",
    isVisible: false,
    isError: false,
  });
  const [processingStatus, setProcessingStatus] = useState<{
    [key: string]: "pending" | "success" | "error";
  }>({});

  // Mostrar notificación
  const showNotification = (
    message: string,
    isError: boolean = false,
    playerId?: string
  ) => {
    setNotification({ message, isVisible: true, isError, playerId });

    // Auto-hide notification after longer time for errors, shorter for success
    // Para errores críticos como duplicados, mostrar por más tiempo
    const hideDelay = isError
      ? message.includes("Ya existe")
        ? 15000
        : 10000
      : 3000;
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isVisible: false }));
    }, hideDelay);
  };

  // Obtener la URL de la API
  const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || "https://futbolink.onrender.com";
  };

  // Cargar jugadores de la Portafolio
  useEffect(() => {
    if (!isOpen || !user || !token) return;

    const fetchPortfolioPlayers = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${getApiUrl()}/user/${user.id}/portfolio`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const players = await response.json();
          setPortfolioPlayers(players);
        } else {
          showNotification("Error al cargar la Portafolio de jugadores", true);
        }
      } catch (error) {
        console.error("Error al cargar Portafolio:", error);
        showNotification("Error al cargar la Portafolio de jugadores", true);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioPlayers();
  }, [isOpen, user, token]);

  // Manejar selección de jugadores
  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  // Seleccionar todos los jugadores
  const selectAllPlayers = () => {
    if (selectedPlayers.length === portfolioPlayers.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(portfolioPlayers.map((player) => player.id!));
    }
  };

  // Enviar aplicaciones
  const handleSubmitApplications = async () => {
    if (selectedPlayers.length === 0) {
      showNotification("Selecciona al menos un jugador", true);
      return;
    }

    setSubmitting(true);
    showNotification(
      `Iniciando proceso de postulación para ${selectedPlayers.length} jugador(es)...`
    );

    let successCount = 0;
    let errorCount = 0;

    // Inicializar estado de procesamiento
    const initialStatus: { [key: string]: "pending" | "success" | "error" } =
      {};
    selectedPlayers.forEach((id) => {
      initialStatus[id] = "pending";
    });
    setProcessingStatus(initialStatus);

    try {
      // Enviar aplicación para cada jugador seleccionado
      for (let i = 0; i < selectedPlayers.length; i++) {
        const playerId = selectedPlayers[i];
        try {
          const player = portfolioPlayers.find((p) => p.id === playerId);
          const playerName = player
            ? `${player.name} ${player.lastname}`
            : "Jugador";

          showNotification(
            `Postulando a ${playerName}... (${i + 1}/${selectedPlayers.length})`
          );

          // Pequeña pausa entre postulaciones para que las notificaciones se vean
          if (i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          const apiUrl = getApiUrl();
          const fullUrl = `${apiUrl}/applications/recruiter-apply`;
          console.log("🔍 API URL:", apiUrl);
          console.log("🔍 Full URL:", fullUrl);
          console.log("🔍 Token presente:", !!token);
          console.log("🔍 Datos enviados:", {
            playerId,
            jobId,
            playerMessage: `Mi representante me ha postulado a esta oferta: "${jobTitle}"`,
            message: "Postulación realizada por reclutador",
          });

          const response = await fetch(fullUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              playerId,
              jobId,
              playerMessage: `Mi representante me ha postulado a esta oferta: "${jobTitle}"`,
              message: "Postulación realizada por reclutador",
            }),
          });

          console.log("🔍 Respuesta status:", response.status);
          console.log(
            "🔍 Respuesta headers:",
            Object.fromEntries(response.headers.entries())
          );

          if (response.ok) {
            const result = await response.json();
            console.log("✅ Postulación exitosa:", result);
            successCount++;
            setProcessingStatus((prev) => ({ ...prev, [playerId]: "success" }));
            // Solo mostrar notificación de éxito individual si es el último jugador o hay pocos jugadores
            if (selectedPlayers.length <= 3) {
              showNotification(`${playerName} postulado exitosamente`);
            }
          } else {
            console.error("❌ Error response status:", response.status);
            const responseText = await response.text();
            console.error("❌ Error response text:", responseText);

            // Intentar parsear como JSON, si no funciona usar el texto
            let error;
            try {
              error = JSON.parse(responseText);
            } catch (e) {
              error = { message: responseText };
            }

            errorCount++;
            setProcessingStatus((prev) => ({ ...prev, [playerId]: "error" }));

            // Usar SIEMPRE el mensaje específico del servidor
            let errorMessage = error.message || "Error desconocido";

            console.log("🔍 Error message from server:", errorMessage);
            console.log("🔍 Full error object:", error);

            // Mostrar el mensaje exacto del servidor con el nombre del jugador
            errorMessage = `${playerName}: ${errorMessage}`;

            // SIEMPRE mostrar notificación de error en la UI
            console.log("🔔 Mostrando notificación de error:", errorMessage);
            showNotification(errorMessage, true);

            // También mostrar toast para errores importantes con duración extendida
            if (response.status === 409) {
              toast.warning(errorMessage, {
                autoClose: 8000, // 8 segundos para errores de duplicado
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
              });
            } else {
              toast.error(errorMessage, {
                autoClose: 6000, // 6 segundos para otros errores
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
              });
            }
            console.error(`Error al postular jugador ${playerId}:`, error);
          }
        } catch (error) {
          console.error(`Error al postular jugador ${playerId}:`, error);
          const player = portfolioPlayers.find((p) => p.id === playerId);
          const playerName = player
            ? `${player.name} ${player.lastname}`
            : "Jugador";
          errorCount++;
          setProcessingStatus((prev) => ({ ...prev, [playerId]: "error" }));
          const connectionErrorMessage = `Error de conexión al postular a ${playerName}. Intenta nuevamente.`;
          showNotification(connectionErrorMessage, true);
          toast.error(connectionErrorMessage, {
            autoClose: 6000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
          });
        }
      }

      // Mostrar resultados finales
      if (successCount > 0 && errorCount === 0) {
        showNotification(
          `¡Éxito! ${successCount} jugador(es) postulado(s) correctamente.`
        );

        // Cerrar modal después de un tiempo si todo fue exitoso
        setTimeout(() => {
          onClose();
          setSelectedPlayers([]);
        }, 2000);
      } else if (successCount > 0 && errorCount > 0) {
        // Mostrar resumen general sin sobrescribir errores específicos
        setTimeout(() => {
          showNotification(
            `Proceso completado: ${successCount} exitoso(s), ${errorCount} con error(es).`
          );
        }, 2000); // Esperar 2 segundos para no sobrescribir errores específicos
      }
      // NO mostrar mensaje genérico cuando solo hay errores,
      // para preservar las notificaciones específicas
    } catch (error) {
      console.error("Error general al enviar aplicaciones:", error);
      showNotification(
        "Error al enviar las aplicaciones. Por favor, intenta nuevamente.",
        true
      );
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
          <h2 className="text-xl font-semibold">
            Postular jugadores a: {jobTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Notification */}
        {notification.isVisible && (
          <div
            className={`p-3 ${
              notification.isError
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            } border-l-4 mx-6 mt-4 rounded`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {notification.isError ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>{notification.message}</span>
              </div>
              <button
                onClick={() =>
                  setNotification((prev) => ({ ...prev, isVisible: false }))
                }
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 flex flex-col h-full max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p>Cargando Portafolio de jugadores...</p>
              </div>
            </div>
          ) : portfolioPlayers.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">
                  No tienes jugadores en tu Portafolio
                </p>
                <p className="text-sm">
                  Añade jugadores a tu Portafolio desde la búsqueda de jugadores
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Selection controls */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={selectAllPlayers}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  {selectedPlayers.length === portfolioPlayers.length
                    ? "Deseleccionar todos"
                    : "Seleccionar todos"}
                </button>
                <span className="text-sm text-gray-600">
                  {selectedPlayers.length} de {portfolioPlayers.length}{" "}
                  seleccionados
                </span>
              </div>

              {/* Players grid */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioPlayers.map((player) => {
                    const isSelected = selectedPlayers.includes(player.id!);
                    const status = processingStatus[player.id!];

                    return (
                      <div
                        key={player.id}
                        onClick={() =>
                          !submitting && togglePlayerSelection(player.id!)
                        }
                        className={`relative cursor-pointer border-2 rounded-lg p-4 transition-all ${
                          isSelected
                            ? status === "success"
                              ? "border-green-500 bg-green-50"
                              : status === "error"
                              ? "border-red-500 bg-red-50"
                              : "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        } ${submitting ? "opacity-80" : ""}`}
                      >
                        {/* Selection indicator */}
                        <div className="absolute top-2 right-2">
                          {isSelected && status === "success" ? (
                            <div className="w-5 h-5 rounded-full bg-green-500 border-green-500 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          ) : isSelected && status === "error" ? (
                            <div className="w-5 h-5 rounded-full bg-red-500 border-red-500 flex items-center justify-center">
                              <span className="text-white text-xs">×</span>
                            </div>
                          ) : (
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? "bg-purple-500 border-purple-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {isSelected && (
                                <span className="text-white text-xs">✓</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Player info */}
                        <div className="flex flex-col items-center text-center">
                          <div className="relative mb-3">
                            <Image
                              src={
                                player.imgUrl ||
                                getDefaultPlayerImage(player.genre)
                              }
                              alt={`${player.name} ${player.lastname}`}
                              width={60}
                              height={60}
                              className="rounded-full object-cover"
                            />
                            {/* Subscription badge */}
                            <div
                              className={`absolute -bottom-1 -right-1 text-xs px-1.5 py-0.5 rounded-full text-white ${
                                player.subscriptionType === "Profesional"
                                  ? "bg-green-600"
                                  : player.subscriptionType ===
                                    "Semiprofesional"
                                  ? "bg-blue-600"
                                  : "bg-gray-500"
                              }`}
                            >
                              {player.subscriptionType === "Profesional"
                                ? "PRO"
                                : player.subscriptionType === "Semiprofesional"
                                ? "SEMI"
                                : "AM"}
                            </div>
                          </div>

                          <h3 className="font-medium text-sm mb-1">
                            {player.name} {player.lastname}
                          </h3>

                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center justify-center gap-1">
                              {player.nationality &&
                                renderCountryFlag(player.nationality)}
                              <span>{player.nationality}</span>
                            </div>

                            {player.primaryPosition && (
                              <p className="text-purple-600 font-medium">
                                {player.primaryPosition}
                              </p>
                            )}

                            {player.age && <p>{player.age} años</p>}
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
                  disabled={selectedPlayers.length === 0 || submitting}
                  className={`px-6 py-2 rounded-md text-white font-medium ${
                    selectedPlayers.length > 0 && !submitting
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </span>
                  ) : (
                    `Postular ${selectedPlayers.length} jugador${
                      selectedPlayers.length !== 1 ? "es" : ""
                    }`
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
