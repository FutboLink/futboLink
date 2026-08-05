import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";
import {
  FaCheckCircle,
  FaEllipsisV,
  FaPaperPlane,
  FaSpinner,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";
import { getDefaultPlayerImage } from "@/helpers/imageUtils";
import { useUserContext } from "@/hook/useUserContext";
import type { User } from "@/Interfaces/IUser";
import { renderCountryFlag } from "../countryFlag/countryFlag";
import { ApplicationStatus } from "@/Interfaces/IOffer";
import type { IJobApplication } from "@/Interfaces/IOffer";
import {
  statusLabel,
  statusStyle,
  markProfileViewed,
} from "@/components/Dashboard/dashboardFetch";

interface UserCardProps {
  application: IJobApplication;
  currentUser: User;
  t: (key: string, params?: Record<string, any>) => string;
  isAddingToPortfolio: string | null;
  handleAddToPortfolio: (playerId: string) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  isShortlisted?: boolean;
  applicationStatus?: ApplicationStatus;
  onStatusChange?: (newStatus: string) => void;
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

const ApplicantCard: React.FC<UserCardProps> = ({
  application,
  currentUser,
  t,
  isAddingToPortfolio,
  handleAddToPortfolio,
  isSelectionMode = false,
  isSelected = false,
  onSelect,
  isShortlisted = false,
  applicationStatus,
  onStatusChange,
}) => {
  const { user, token } = useUserContext();
  const pathname = usePathname();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowDropdown(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

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
      className={`group relative flex items-center px-6 py-3 border-b border-gray-200 transition-colors duration-150 hover:bg-gray-50 ${
       isSelected ? "bg-green-50" : ""
       } ${isShortlisted ? "bg-green-50" : ""}`}
    style={{
      cursor: "pointer",
      minHeight: "78px",
    }}
      onClick={(e) => {
  if (isSelectionMode && onSelect) {
    e.preventDefault();
    onSelect();
    return;
  }

  router.push(`/user-viewer/${currentUser.id}`);
}}
    >
      {/* Fila superior: foto + info + dropdown */}
      <div className="flex items-center w-full">
        {/* Foto */}
        <div className="w-[90px] flex justify-center relative">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center">
  {currentUser.imgUrl ? (
    <Image
      src={currentUser.imgUrl}
      alt={`${currentUser.name} ${currentUser.lastname}`}
      width={96}
      height={96}
      className="object-cover w-full h-full"
    />
  ) : (
    <FaUser className="text-gray-300 text-4xl" />
  )}
</div>
          {verificationStatus.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
              <FaCheckCircle className="text-white text-xs" />
            </div>
          )}
        </div>

        {/* Información */}
<div className="flex-1 grid grid-cols-[3fr_180px_160px_120px] items-center gap-4">

{/* Candidato */}
<div>
  <div className="flex items-center gap-2">
    <h3 className="font-semibold text-gray-900">
      {currentUser.name} {currentUser.lastname}
    </h3>

    {verificationStatus.isVerified && (
      <FaCheckCircle className="text-blue-500 text-sm" />
    )}
  </div>

  <p className="text-sm text-gray-500 mt-1">
    {isPlayer
      ? `${currentUser.primaryPosition
          ? abbreviatePosition(currentUser.primaryPosition)
          : "-"}${
          currentUser.secondaryPosition
            ? ` / ${abbreviatePosition(currentUser.secondaryPosition)}`
            : ""
        }${
          currentUser.age ? ` • ${currentUser.age} años` : ""
        }`
      : getRoleName(currentUser.role || "")}
  </p>
</div>

{/* País */}
<div className="text-sm">
  {currentUser.nationality
    ? renderCountryFlag(currentUser.nationality)
    : "-"}
</div>

{/* Estado */}
<div>
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyle(application.status)}`}
  >
    {statusLabel(application.status)}
  </span>
</div>

{/* Acciones */}
<div className="flex justify-center">
<button
  className="px-3 py-1.5 text-sm rounded-lg border border-[#3d7a26] text-[#3d7a26] hover:bg-[#eef7ea] transition"
  onClick={async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (token) {
      await markProfileViewed(application.id, token);
    }

    router.push(`/user-viewer/${currentUser.id}`);
  }}
>
  Ver perfil
</button>
</div>
</div>

        {/* Dropdown */}
          <div
  ref={dropdownRef}
  className={`absolute top-4 right-4 z-10 transition-opacity duration-200 ${
    showDropdown ? "opacity-100" : "opacity-0 group-hover:opacity-100"
  }`}
>
          <button
            className="flex items-center justify-center w-8 h-8 rounded-xl border border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all duration-200"
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
            <div className="absolute right-0 top-11 w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg z-30">
              <Link
                href={`/user-viewer/${currentUser.id}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                onClick={() => setShowDropdown(false)}
              >
                <FaUserPlus className="inline mr-2" />
                {t("viewProfile")}
              </Link>

              {user && (user.role === "RECRUITER" || user.role === "AGENCY") && isPlayer && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToPortfolio(currentUser.id);
                    setShowDropdown(false);
                  }}
                  disabled={isBeingAddedToPortfolio}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
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
    </div>
  );
};

export default ApplicantCard;
