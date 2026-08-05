"use client";

import Image from "next/image";
import Link from "next/link";
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
    px-5
    py-4
    border-b
    border-gray-100
    active:bg-gray-50
    transition-all
  "
>

  <div className="flex items-start gap-4">

        {/* FOTO */}
        <div className="mr-3 flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 shadow-sm">

            {currentUser.imgUrl ? (
              <Image
                src={currentUser.imgUrl}
                alt={`${currentUser.name ?? ""} ${currentUser.lastname ?? ""}`}
                width={72}
                height={72}
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

          <div className="flex items-start justify-between">

            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-2">

  <h3 className="font-bold text-[22px] leading-6 text-gray-900 truncate">
    {currentUser.name} {currentUser.lastname}
  </h3>

  {currentUser.isVerified && (
  <FaCheckCircle className="text-blue-500 text-sm shrink-0" />
)}

</div>

              <p className="text-[16px] text-gray-500 mt-2">
                {currentUser.primaryPosition || "-"}
                {currentUser.age && ` • ${currentUser.age} años`}
              </p>

              {currentUser.nationality && (
                <div className="flex items-center gap-2 mt-3 text-[15px] text-gray-600">
                  <span>{renderCountryFlag(currentUser.nationality)}</span>
                  <span>{currentUser.nationality}</span>
                </div>
              )}

            </div>

            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="
w-12
h-12
rounded-xl
border
border-gray-200
bg-white
flex
items-center
justify-center
shadow-sm
transition-all
hover:bg-gray-50
hover:shadow-md
active:scale-95
"
            >
              <FaEllipsisV className="text-lg text-gray-500" />
            </button>

          </div>

          <div className="flex items-center justify-between mt-5">

  {/* Botones */}
  <div className="flex gap-3">

    <button
      onClick={() => router.push(`/user-viewer/${currentUser.id}`)}
      className="
        w-12
        h-12
        rounded-2xl
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
      <FaEye className="text-[#3d7a26] text-lg" />
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
        w-12
        h-12
        rounded-2xl
        bg-[#3d7a26]
        text-white
        flex
        items-center
        justify-center
        shadow-md
        active:scale-95
      "
    >
      <FaThumbsUp className="text-lg" />
    </button>

  </div>

  {/* Estado */}
  <span
    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyle(application.status)}`}
  >
    {statusLabel(application.status)}
  </span>

</div>

              <button
                onClick={() => router.push(`/user-viewer/${currentUser.id}`)}
                className="
w-11
h-11
rounded-xl
border
border-gray-200
bg-white
flex
items-center
justify-center
shadow-sm
transition-all
hover:shadow-md
active:scale-95
"
              >
                <FaEye />
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
w-11
h-11
rounded-xl
bg-[#3d7a26]
text-white
flex
items-center
justify-center
shadow-md
transition-all
hover:bg-[#2f601d]
active:scale-95
"
              >
                <FaThumbsUp />
              </button>
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

      </div>

    </div>
  );
};
export default ApplicantCardMobile;
