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

const ApplicantCard: React.FC<UserCardProps> = ({
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
      className={`group bg-white relative flex items-center border border-gray-200 rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition-all duration-200 ${
        isSelected ? "ring-2 ring-green-500 border-green-500" : ""
       } ${isShortlisted ? "bg-green-50" : ""}`}
    style={{
      cursor: "pointer",
      minHeight: "160px",
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
        <div className="flex-shrink-0 relative mb-2">
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center">
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
<div className="flex-1 grid grid-cols-[2.5fr_80px_1.5fr_1.5fr_120px_60px] items-center gap-6 pl-6">

  {/* Nombre */}
  <div>
    <h3 className="font-semibold text-gray-900">
      {currentUser.name} {currentUser.lastname}
    </h3>

    {verificationStatus.isVerified && (
      <FaCheckCircle className="text-blue-500 text-sm mt-1" />
    )}
  </div>

  {/* Edad */}
  <div className="text-sm text-gray-700 text-center">
    {currentUser.age || "-"}
  </div>

  {/* Posición */}
  <div className="text-sm text-gray-700">
    {isPlayer
      ? `${currentUser.primaryPosition
          ? abbreviatePosition(currentUser.primaryPosition)
          : "-"}${
          currentUser.secondaryPosition
            ? ` / ${abbreviatePosition(currentUser.secondaryPosition)}`
            : ""
        }`
      : getRoleName(currentUser.role || "")}
  </div>

  {/* País */}
  <div>
    {currentUser.nationality
      ? renderCountryFlag(currentUser.nationality)
      : "-"}
  </div>

  {/* Estado */}
  <div>
    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
      {getStatus()}
    </span>
  </div>

  {/* Acciones */}
<div className="flex justify-center">
  <button
    className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowDropdown(!showDropdown);
    }}
  >
    <FaEllipsisV className="text-sm" />
  </button>
</div>

</div>
      </div>
    </div>
  );
};

export default ApplicantCard;
