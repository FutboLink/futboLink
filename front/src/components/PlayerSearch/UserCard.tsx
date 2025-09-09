import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";
import {
  FaCheckCircle,
  FaEllipsisV,
  FaPaperPlane,
  FaSpinner,
  FaUserPlus,
} from "react-icons/fa";
import { getDefaultPlayerImage } from "@/helpers/imageUtils";
import { useUserContext } from "@/hook/useUserContext";
import type { User } from "@/Interfaces/IUser";
import { renderCountryFlag } from "../countryFlag/countryFlag";

interface UserCardProps {
  currentUser: User;
  t: (key: string, params?: Record<string, any>) => string;
  isAddingToPortfolio: string | null;
  handleAddToPortfolio: (playerId: string) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  isShortlisted?: boolean;
}

interface VerificationStatus {
  isVerified: boolean;
  columnExists: boolean;
}

// Abreviar posiciones
const abbreviatePosition = (position: string): string => {
  const abbreviations: Record<string, string> = {
    Portero: "POR",
    Goalkeeper: "GK",
    "Defensa Central": "DC",
    "Central Defender": "CB",
    Defensa: "DEF",
    Defender: "DEF",
    "Lateral Derecho": "LD",
    "Right Back": "RB",
    "Lateral Izquierdo": "LI",
    "Left Back": "LB",
    "Mediocentro Defensivo": "MCD",
    "Defensive Midfielder": "CDM",
    Mediocentro: "MC",
    "Central Midfielder": "CM",
    "Mediocentro Ofensivo": "MCO",
    "Attacking Midfielder": "CAM",
    "Extremo Derecho": "ED",
    "Right Winger": "RW",
    "Extremo Izquierdo": "EI",
    "Left Winger": "LW",
    "Delantero Centro": "DC",
    Striker: "ST",
    Delantero: "DEL",
    Forward: "FW",
  };
  return abbreviations[position] || position.substring(0, 3).toUpperCase();
};

const UserCard: React.FC<UserCardProps> = ({
  currentUser,
  t,
  isAddingToPortfolio,
  handleAddToPortfolio,
  isSelectionMode = false,
  isSelected = false,
  onSelect,
  isShortlisted = false,
}) => {
  const { user, token } = useUserContext();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>({ isVerified: false, columnExists: false });

  const isPlayer = currentUser.role === "PLAYER";

  const hasSubscription = (subscriptionName: string): boolean =>
    currentUser.subscriptionType === subscriptionName ||
    currentUser.subscription === subscriptionName;

  const subscriptionType = (() => {
    if (
      hasSubscription("Profesional") ||
      hasSubscription("profesional") ||
      hasSubscription("Professional")
    )
      return "professional";
    if (
      hasSubscription("Semiprofesional") ||
      hasSubscription("semiprofesional") ||
      hasSubscription("Semi-profesional")
    )
      return "semi";
    return "amateur";
  })();

  const levelText = {
    professional: t("professional"),
    semi: t("semi"),
    amateur: t("amateur"),
  }[subscriptionType];

  const isBeingAddedToPortfolio = isAddingToPortfolio === currentUser.id;

  // Fetch estado verificado
  const fetchVerificationStatus = async (userId: string) => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "https://futbolink.onrender.com";
      const response = await fetch(
        `${API_URL}/user/${userId}/verification-status`,
        {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        }
      );
      if (response.ok) {
        const status = await response.json();
        setVerificationStatus(status);
      } else setVerificationStatus({ isVerified: false, columnExists: false });
    } catch (error) {
      setVerificationStatus({ isVerified: false, columnExists: false });
    }
  };

  useEffect(() => {
    if (currentUser.id) fetchVerificationStatus(currentUser.id);
  }, [currentUser.id]);

  if (!user) return null;

  const showButton =
    user &&
    (user.role === "RECRUITER" || isPlayer) &&
    pathname !== "/applications/jobs";
  if (!showButton) return null;

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      RECRUITER: "Reclutador",
      COACH: "Entrenador",
      SCOUT: "Ojeador",
      AGENT: "Agente",
      CLUB_MANAGER: "Director Deportivo",
      PLAYER: "Jugador",
    };
    return roleNames[role] || role;
  };

  const getStatus = () => (isPlayer ? "Libre" : "Disponible");

  console.log(currentUser, "opaaa");

  return (
    <div
      key={currentUser.id}
      className={`bg-white shadow-md hover:shadow-lg transition-all relative flex flex-col border border-gray-200 rounded-lg p-3 ${
        isSelected ? "ring-2 ring-green-500 border-green-500" : ""
      } ${isShortlisted ? "bg-green-50" : ""}`}
      style={{
        cursor: isSelectionMode ? "pointer" : "default",
        minHeight: "120px",
      }}
      onClick={(e) => {
        if (isSelectionMode && onSelect) {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Fila superior: foto + info + dropdown */}
      <div className="flex items-start">
        {/* Foto */}
        <div className="flex-shrink-0 relative">
          <div className="w-12 h-12 rounded-full border-2 border-green-500 overflow-hidden">
            <Image
              src={currentUser.imgUrl || getDefaultPlayerImage()}
              alt={`${currentUser.name} ${currentUser.lastname}`}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
          {verificationStatus.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
              <FaCheckCircle className="text-white text-xs" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-grow ml-3 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {currentUser.nationality &&
              renderCountryFlag(currentUser.nationality)}
            <h3 className="text-gray-900 font-semibold text-sm truncate">
              {currentUser.name} {currentUser.lastname}
            </h3>
            {verificationStatus.isVerified && (
              <FaCheckCircle className="text-blue-500 text-sm flex-shrink-0" />
            )}
          </div>

          {/* Edad + Posiciones */}
          <div className="flex items-center gap-2 text-xs mb-1">
            {currentUser.age && (
              <>
                <span className="text-gray-600 flex-shrink-0">
                  {currentUser.age}
                </span>
                {(currentUser.primaryPosition ||
                  currentUser.secondaryPosition) && (
                  <span className="text-gray-400">|</span>
                )}
              </>
            )}

            {currentUser.puesto && currentUser.skillfulFoot === "" && (
              <>
                {currentUser.age && <span className="text-gray-400">|</span>}
                <span className="text-gray-600 flex-shrink-0">
                  {currentUser.puesto}
                </span>
                {(currentUser.primaryPosition ||
                  currentUser.secondaryPosition) && (
                  <span className="text-gray-400">|</span>
                )}
              </>
            )}

            {isPlayer &&
              (currentUser.primaryPosition ||
                currentUser.secondaryPosition) && (
                <span className="text-gray-600">
                  {currentUser.primaryPosition &&
                    abbreviatePosition(currentUser.primaryPosition)}
                  {currentUser.secondaryPosition &&
                    ` / ${abbreviatePosition(currentUser.secondaryPosition)}`}
                </span>
              )}
          </div>

          {/* Nivel/rol + Estado */}
          <div className="flex items-center gap-2 text-xs">
            {isPlayer ? (
              <span
                className={`text-white text-[10px] font-medium py-0.5 px-2 rounded-full ${
                  subscriptionType === "professional"
                    ? "bg-green-600"
                    : subscriptionType === "semi"
                    ? "bg-blue-600"
                    : "bg-gray-400"
                }`}
              >
                {levelText}
              </span>
            ) : (
              <span className="text-gray-900 font-medium">
                {getRoleName(currentUser.role || "")}
              </span>
            )}
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">{getStatus()}</span>
          </div>
        </div>

        {/* Dropdown */}
        <div className="flex-shrink-0 ml-2 relative">
          <button
            className="text-gray-400 hover:text-gray-600 p-1"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
          >
            <FaEllipsisV className="text-sm" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[180px] z-30">
              <Link
                href={`/user-viewer/${currentUser.id}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                <FaUserPlus className="inline mr-2" />
                {t("viewProfile")}
              </Link>

              {user && user.role === "RECRUITER" && isPlayer && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToPortfolio(currentUser.id);
                    setShowDropdown(false);
                  }}
                  disabled={isBeingAddedToPortfolio}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  {isBeingAddedToPortfolio ? (
                    <>
                      <FaSpinner className="inline mr-2 animate-spin" />
                      {t("Enviando...")}
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="inline mr-2" />
                      {t("Solicitar representación")}
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botón que ocupa toda la card */}
      <Link
        href={`/user-viewer/${currentUser.id}`}
        className="mt-3 w-full border border-blue-600 text-blue-600 text-xs font-medium py-2 px-3 rounded-lg text-center hover:bg-blue-50 transition"
      >
        {t("viewProfile")}
      </Link>

      {showDropdown && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-transparent cursor-default"
          onClick={() => setShowDropdown(false)}
          aria-label="Cerrar menú"
        />
      )}
    </div>
  );
};

export default UserCard;
