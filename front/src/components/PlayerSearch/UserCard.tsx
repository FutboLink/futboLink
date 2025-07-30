import React, { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaShieldAlt } from "react-icons/fa";
import { getDefaultPlayerImage } from "@/helpers/imageUtils";
import { renderCountryFlag } from "../countryFlag/countryFlag";
import { User } from "@/Interfaces/IUser";
import { FaUserPlus, FaSpinner, FaPaperPlane } from "react-icons/fa";
import {
  HiOutlineInformationCircle,
  HiOutlineMail,
  HiOutlinePhone,
} from "react-icons/hi";
import { useUserContext } from "@/hook/useUserContext";

interface UserCardProps {
  currentUser: User;
  t: (key: string, params?: Record<string, any>) => string;
  isAddingToPortfolio: string | null;

  handleAddToPortfolio: (playerId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  currentUser,
  t,
  isAddingToPortfolio,
  handleAddToPortfolio,
}) => {
  const { user } = useUserContext();
  // Verificar si el usuario actual es jugador
  const isPlayer = currentUser.role === "PLAYER";

  // Verificar si el usuario actual es reclutador
  const isRecruiter = currentUser.role === "RECRUITER";

  // Función auxiliar para verificar si el usuario tiene una suscripción específica
  const hasSubscription = (subscriptionName: string): boolean => {
    return (
      currentUser.subscriptionType === subscriptionName ||
      currentUser.subscription === subscriptionName
    );
  };

  // Determinar tipo de suscripción usando ambos campos: subscriptionType y subscription
  const subscriptionType = (() => {
    if (
      hasSubscription("Profesional") ||
      hasSubscription("profesional") ||
      hasSubscription("Professional")
    ) {
      return "professional";
    }
    if (
      hasSubscription("Semiprofesional") ||
      hasSubscription("semiprofesional") ||
      hasSubscription("Semi-profesional")
    ) {
      return "semi";
    }
    return "amateur";
  })();

  // Color de la insignia según tipo de suscripción o rol
  const badgeBgClass = isRecruiter
    ? "bg-purple-800"
    : {
        professional: "bg-green-800",
        semi: "bg-blue-700",
        amateur: "bg-gray-700",
      }[subscriptionType];

  // Texto de la insignia según tipo de suscripción o rol
  const badgeText = isRecruiter
    ? t("recruiter")
    : {
        professional: t("professional"),
        semi: t("semi"),
        amateur: t("amateur"),
      }[subscriptionType];

  // Verificar si este usuario está siendo añadido a la cartera para mostrar estado de carga
  const isBeingAddedToPortfolio = isAddingToPortfolio === currentUser.id;

  // Obtener el array de trayectorias para sacar el último club
  const trayectorias = currentUser?.trayectorias;

  // Obtener el nombre del último club o poner "----" si no hay datos
  const lastClub = trayectorias?.length
    ? trayectorias[trayectorias.length - 1].club
    : "----";

  // Si no hay usuario logueado (contexto), no renderizar nada
  if (!user) {
    return null;
  }

  return (
    <div
      key={currentUser.id}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all relative flex flex-col h-full"
    >
      {/* Imagen de fondo/header */}
      <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 relative overflow-hidden">
        {/* Imagen de fondo (misma que la de perfil) */}
        {currentUser.imgUrl && (
          <div className="absolute inset-0">
            <Image
              src={currentUser.imgUrl}
              alt=""
              fill
              className="object-cover blur-[1px]"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        )}
        {/* Gradiente decorativo si no hay imagen */}
        {!currentUser.imgUrl && (
          <div
            className={`absolute inset-0 bg-gradient-to-r ${
              isRecruiter
                ? "from-purple-800 to-purple-600"
                : subscriptionType === "professional"
                ? "from-green-800 to-green-600"
                : subscriptionType === "semi"
                ? "from-blue-700 to-blue-500"
                : "from-gray-700 to-gray-500"
            }`}
          ></div>
        )}
      </div>
      {/* Contenido principal */}
      <div className="px-4 pb-4 pt-12 relative flex flex-col h-full">
        <div className="absolute -top-10 left-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md">
              <Image
                src={currentUser.imgUrl || getDefaultPlayerImage()}
                alt={`${currentUser.name} ${currentUser.lastname}`}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
            {/* Indicador de tipo de suscripción */}
            <div
              className={`absolute -right-8 -bottom-1 ${badgeBgClass} text-white text-xs py-0.5 px-2 rounded-full font-medium shadow-sm`}
            >
              <span>{badgeText}</span>
            </div>
          </div>
        </div>
        <div className="flex-grow">
          {/* Nombre y información */}
          <div className="mb-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {currentUser.name} {currentUser.lastname}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {isPlayer && (
                <>
                  {currentUser.primaryPosition || t("notSpecified")}
                  {currentUser.secondaryPosition &&
                    ` / ${currentUser.secondaryPosition}`}
                </>
              )}
              {isRecruiter && (
                <>
                  {t("recruiter")}
                  {currentUser.ubicacionActual &&
                    ` - ${currentUser.ubicacionActual}`}
                </>
              )}
              {currentUser.nationality && ` | ${currentUser.nationality}`}
            </p>
          </div>
          {/* Detalles adicionales */}
          <div className="text-xs text-gray-500 space-y-1">
            {isPlayer && (
              <>
                {currentUser.age && (
                  <div className="flex items-center gap-1">
                    <span>
                      {t("age")}: {currentUser.age}
                    </span>
                  </div>
                )}
                {lastClub && (
                  <div className="flex items-center text-xs gap-1 text-gray-500 space-y-1 mb-4">
                    <FaShieldAlt className="w-3.5 h-3.5" />
                    <span>
                      {t("Club actual")}: {lastClub}
                    </span>
                  </div>
                )}
                {currentUser.height && (
                  <div className="flex items-center gap-1">
                    <span>
                      {t("height")}: {currentUser.height} cm
                    </span>
                  </div>
                )}
                {currentUser.skillfulFoot && (
                  <div className="flex items-center gap-1">
                    <span>
                      {t("skillfulFoot")}: {currentUser.skillfulFoot}
                    </span>
                  </div>
                )}
              </>
            )}

            {isRecruiter && (
              <>
                <div className="bg-yellow-50 border border-yellow-100 rounded p-1 mb-2">
                  <div className="flex items-center">
                    <HiOutlineInformationCircle className="h-3 w-3 text-yellow-600 mr-1" />
                    <span className="text-xs text-yellow-700">
                      Contacto no disponible con tu suscripción
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-2">
                  <HiOutlineMail className="h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate text-gray-400">●●●●●●●●</span>
                </div>

                <div className="flex items-center gap-1 mb-2">
                  <HiOutlinePhone className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-gray-400">●●●●●●●●</span>
                </div>
              </>
            )}
            {/* Nacionalidad con bandera */}
            {currentUser.nationality && (
              <div className="flex items-center gap-1">
                <span className="flex items-center">
                  {renderCountryFlag(currentUser.nationality)}
                </span>
                <span>{currentUser.nationality}</span>
              </div>
            )}
          </div>
        </div>
        {/* Botones de acción */}
        <div className="flex flex-col space-y-2 mt-auto">
          {/* Botón de ver perfil */}
          <Link
            href={`/user-viewer/${currentUser.id}`}
            className={`flex items-center justify-center w-full py-1.5 px-3 border rounded-full text-sm font-medium transition-colors ${
              isRecruiter
                ? "border-purple-600 text-purple-600 hover:bg-purple-50"
                : "border-blue-600 text-blue-600 hover:bg-blue-50"
            }`}
          >
            <FaUserPlus className="h-4 w-4 mr-1" />
            {t("viewProfile")}
          </Link>

          {/* Botón de añadir a cartera (solo visible para reclutadores y para jugadores) */}
          {user && user.role === "RECRUITER" && isPlayer && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToPortfolio(currentUser.id);
              }}
              disabled={isBeingAddedToPortfolio}
              className="flex items-center justify-center w-full py-1.5 px-3 border border-green-600 text-green-600 rounded-full text-sm font-medium hover:bg-green-50 transition-colors"
            >
              {isBeingAddedToPortfolio ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-600" />
                  Enviando...
                </span>
              ) : (
                <>
                  <FaPaperPlane className="h-4 w-4 mr-1" />
                  Enviar solicitud
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
