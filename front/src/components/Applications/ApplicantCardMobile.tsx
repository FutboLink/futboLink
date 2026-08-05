"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import {
  FaCheckCircle,
  FaEllipsisV,
  FaEye,
  FaPaperPlane,
  FaSpinner,
  FaThumbsUp,
  FaUser,
} from "react-icons/fa";

import { useUserContext } from "@/hook/useUserContext";
import type { User } from "@/Interfaces/IUser";
import {
  ApplicationStatus,
  IJobApplication,
} from "@/Interfaces/IOffer";

import { renderCountryFlag } from "../countryFlag/countryFlag";

import {
  statusLabel,
  statusStyle,
  markInterest,
} from "@/components/Dashboard/dashboardFetch";

interface ApplicantCardMobileProps {
  application: IJobApplication;
  currentUser: User;
  t: (key: string, params?: Record<string, any>) => string;
  isAddingToPortfolio: string | null;
  handleAddToPortfolio: (playerId: string) => void;
  isShortlisted?: boolean;
  applicationStatus?: ApplicationStatus;
  onStatusChange?: (newStatus: string) => void;
}
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
const ApplicantCardMobile: React.FC<ApplicantCardMobileProps> = ({
  application,
  currentUser,
  t,
  isAddingToPortfolio,
  handleAddToPortfolio,
  isShortlisted = false,
  applicationStatus,
  onStatusChange,
}) => {
  const { user, token } = useUserContext();

  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);

  const isPlayer = currentUser.role === "PLAYER";

  const isBeingAddedToPortfolio =
    isAddingToPortfolio === currentUser.id;

  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">

      {/* Header */}
      <div className="flex items-start gap-3">

        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center">
            {currentUser.imgUrl ? (
              <Image
                src={currentUser.imgUrl}
                alt={`${currentUser.name} ${currentUser.lastname}`}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <FaUser className="text-gray-300 text-4xl" />
            )}
          </div>
        </div>

        <div className="flex-1">

          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-base">
              {currentUser.name} {currentUser.lastname}
            </h3>

            <FaCheckCircle className="text-blue-500 text-sm" />
          </div>

          <p className="text-sm text-gray-500 mt-1">
            {abbreviatePosition(currentUser.primaryPosition || "-")}
            {currentUser.age && ` • ${currentUser.age} años`}
          </p>

          <div className="flex items-center gap-2 mt-2 text-sm text-gray-700">
  {currentUser.nationality ? (
    <>
      <span>{renderCountryFlag(currentUser.nationality)}</span>
      <span>{currentUser.nationality}</span>
    </>
  ) : (
    <span>-</span>
  )}
</div>

          <div className="mt-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyle(application.status)}`}
            >
              {statusLabel(application.status)}
            </span>
          </div>

        </div>

      </div>

      {/* Botones */}

      <div className="grid grid-cols-3 gap-3 mt-5">

        <button
          onClick={() => router.push(`/user-viewer/${currentUser.id}`)}
          className="h-12 rounded-xl border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 active:scale-95 transition"
        >
          <FaEye className="text-[#3d7a26] text-xl" />
        </button>

        <button
          onClick={async () => {
            if (!token) return;

            const ok = await markInterest(application.id, token);

            if (ok) {
              onStatusChange?.("INTERESTED");
            }
          }}
          className="h-12 rounded-xl bg-[#3d7a26] text-white flex items-center justify-center hover:bg-[#2f601d] active:scale-95 transition"
        >
          <FaThumbsUp className="text-xl" />
        </button>

        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="h-12 rounded-xl border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 active:scale-95 transition"
        >
          <FaEllipsisV />
        </button>

      </div>

      {showDropdown && (

        <div className="mt-3 border rounded-xl overflow-hidden">

          <Link
            href={`/user-viewer/${currentUser.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
          >
            <FaEye />

            Ver perfil
          </Link>

          {isPlayer && (

            <button
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50"
              onClick={() => {
                handleAddToPortfolio(currentUser.id);
                setShowDropdown(false);
              }}
            >
              {isBeingAddedToPortfolio ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaPaperPlane />
              )}

              Solicitar representación

            </button>

          )}

        </div>

      )}

    </div>
  );
  };

export default ApplicantCardMobile;
