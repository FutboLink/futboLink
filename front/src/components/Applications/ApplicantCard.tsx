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
  FaEye,
  FaThumbsUp,
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
  markInterest,
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
        <div className="w-16 flex justify-start relative">
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
<div className="flex-1 grid grid-cols-[2.8fr_240px_180px_210px] items-center gap-4">

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
<div className="flex items-center gap-2 text-sm text-gray-700">

  {currentUser.nationality ? (
    <>
      <span>{renderCountryFlag(currentUser.nationality)}</span>

      <span className="font-medium">
        {currentUser.nationality}
      </span>
    </>
  ) : (
    "-"
  )}

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
<div className="flex items-center justify-center gap-3">

  {/* Ver perfil */}
  <button
    title="Ver perfil"
    className="
      flex items-center justify-center
      w-11 h-11
      rounded-xl
      border border-gray-200
      bg-white
      text-[#3d7a26]
      shadow-sm
      transition-all duration-200
      hover:bg-[#eef7ea]
      hover:shadow-md
      hover:scale-105
      active:scale-95
    "
    onClick={(e) => {
      e.stopPropagation();
      router.push(`/user-viewer/${currentUser.id}`);
    }}
  >
    <FaEye className="text-lg" />
  </button>

  {/* Me interesa */}
  <button
    title="Me interesa"
    className="
      flex items-center justify-center
      w-11 h-11
      rounded-xl
      bg-[#3d7a26]
      text-white
      shadow-sm
      transition-all duration-200
      hover:bg-[#2f601d]
      hover:shadow-lg
      hover:scale-105
      active:scale-95
    "
    onClick={async (e) => {
      e.stopPropagation();

      if (!token) return;

      const ok = await markInterest(application.id, token);

      if (ok) {
        onStatusChange?.("INTERESTED");
      }
    }}
  >
    <FaThumbsUp className="text-lg" />
  </button>

    </div>
  </div>

        {/* Dropdown */}
<div
  ref={dropdownRef}
  className="relative"
>
<button
  type="button"
  title="Más acciones"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  }}
  className="
    flex items-center justify-center
    w-11 h-11
    rounded-xl
    border border-gray-200
    bg-white
    text-gray-600
    shadow-sm
    transition-all duration-200
    hover:bg-gray-50
    hover:shadow-md
    hover:scale-105
    active:scale-95
  "
>
  <FaEllipsisV className="text-base" />
</button>
          </button>

          {showDropdown && (
            <div
  className="
    absolute
    right-0
    top-14
    w-64
    rounded-2xl
    border
    border-gray-200
    bg-white
    p-2
    shadow-2xl
    z-30
    animate-in
    fade-in
    zoom-in-95
  "
>
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
