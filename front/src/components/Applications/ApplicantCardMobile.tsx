"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import {
FaUser,
FaEye,
FaThumbsUp,
FaEllipsisV,
FaPaperPlane,
FaSpinner,
FaCheckCircle
} from "react-icons/fa";

import { useUserContext } from "@/hook/useUserContext";
import type { User } from "@/Interfaces/IUser";
import type { IJobApplication, ApplicationStatus } from "@/Interfaces/IOffer";

import {
  statusLabel,
  statusStyle,
  markInterest,
  markProfileViewed,
} from "@/components/Dashboard/dashboardFetch";

import { renderCountryFlag } from "../countryFlag/countryFlag";

interface Props {
application: IJobApplication;
currentUser: User;
t: (key:string)=>string;
isAddingToPortfolio:string|null;
handleAddToPortfolio:(id:string)=>void;
isSelectionMode?: boolean;
isSelected?: boolean;
onSelect?: () => void;
isShortlisted?: boolean;
applicationStatus?:ApplicationStatus;
onStatusChange?:(status:string)=>void;
}
const ApplicantCardMobile: React.FC<Props> = ({
  application,
  currentUser,
  t,
  isAddingToPortfolio,
  handleAddToPortfolio,
  isSelectionMode,
  isSelected,
  onSelect,
  isShortlisted,
  applicationStatus,
  onStatusChange,
}) => {
  const { token } = useUserContext();
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div
  className="
    bg-white
    px-4
    py-3
    border-b
    border-gray-100
    active:bg-gray-50
    transition-all
  "
>

  <div className="flex items-start gap-4">

        {/* FOTO */}
        <div className="mr-3 flex-shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100">

            {currentUser.imgUrl ? (
              <Image
                src={currentUser.imgUrl}
                alt={`${currentUser.name ?? ""} ${currentUser.lastname ?? ""}`}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FaUser className="text-gray-300 text-3xl" />
              </div>
            )}

          </div>
        </div>

{/* INFORMACIÓN */}
<div className="flex-1 min-w-0">

  {/* Cabecera */}
  <div className="flex justify-between items-start">

    <div className="min-w-0 flex-1">

      <h3 className="text-[17px] font-semibold text-gray-900 truncate">
        {currentUser.name} {currentUser.lastname}
      </h3>

      <p className="mt-1 text-[13px] text-gray-500">
        {currentUser.primaryPosition || "-"}
        {currentUser.age && ` • ${currentUser.age} años`}
      </p>

      {currentUser.nationality && (
        <div className="flex items-center gap-2 mt-1 text-[13px] text-gray-600">
          <span>{renderCountryFlag(currentUser.nationality ?? "")}</span>
          <span>{currentUser.nationality}</span>
        </div>
      )}

      <div className="mt-3">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold ${statusStyle(application.status)}`}
        >
          {statusLabel(application.status)}
        </span>
      </div>

    </div>

    <div className="flex flex-col items-center gap-2 ml-4">

      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="
        w-10
        h-10
        rounded-xl
        border
        border-gray-200
        bg-white
        flex
        items-center
        justify-center
        shadow-sm
        active:scale-95
        "
      >
        <FaEllipsisV className="text-gray-500" />
      </button>

      <button
        onClick={async () => {
          
    console.log("TOKEN:", token);
    console.log("APPLICATION:", application.id);
          
  if (token) {
    await markProfileViewed(application.id, token);
    onStatusChange?.("PROFILE_VIEWED");
  }

  router.push(`/user-viewer/${currentUser.id}`);
}}
        className="
        w-10
        h-10
        rounded-xl
        border
        border-gray-200
        bg-white
        flex
        items-center
        justify-center
        shadow-sm
        active:scale-95
        "
      >
        <FaEye className="text-[#3d7a26]" />
      </button>

      <button
        onClick={async () => {

          if (!token) return;

          const ok = await markInterest(application.id, token);

          if (ok) {
            onStatusChange?.("INTERESTED");
          }

        }}
        className="
        w-10
        h-10
        rounded-xl
        bg-[#3d7a26]
        text-white
        flex
        items-center
        justify-center
        shadow-md
        active:scale-95
        "
      >
        <FaThumbsUp />
      </button>

    </div>

  </div>
  
              {/* Bottom Sheet */}
{showDropdown && (
  <>
    {/* Fondo oscuro */}
    <div
      className="fixed inset-0 bg-black/40 z-40"
      onClick={() => setShowDropdown(false)}
    />

    {/* Panel */}
    <div className="
fixed
bottom-0
left-0
right-0
z-50
bg-white
rounded-t-[32px]
px-6
pt-4
pb-8
shadow-2xl
animate-[slideUp_.25s_ease]
">

      <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />

      <button
        onClick={() => {
          router.push(`/user-viewer/${currentUser.id}`);
          setShowDropdown(false);
        }}
        className="
w-full
flex
items-center
gap-4
rounded-2xl
px-3
py-4
text-left
transition
hover:bg-gray-50
"
      >
        <FaEye className="text-[#3d7a26] text-xl" />
        <span className="font-medium">Ver perfil completo</span>
      </button>
<div className="h-px bg-gray-100 my-2" />
      <button
        onClick={() => {
          handleAddToPortfolio(currentUser.id);
          setShowDropdown(false);
        }}
        disabled={isAddingToPortfolio === currentUser.id}
        className="
w-full
flex
items-center
gap-4
rounded-2xl
px-3
py-4
text-left
transition
hover:bg-gray-50
"
      >
        {isAddingToPortfolio === currentUser.id ? (
          <>
            <FaSpinner className="animate-spin text-xl" />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <FaPaperPlane className="text-[#3d7a26] text-xl" />
            <span>Solicitar representación</span>
          </>
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

export default ApplicantCardMobile;
