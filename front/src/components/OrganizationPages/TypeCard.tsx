"use client";

import type { IconType } from "react-icons";
import type { OrganizationPageType } from "@/types/organizationPage";

interface TypeCardProps {
  type: OrganizationPageType;
  title: string;
  description: string;
  Icon: IconType;
  selected?: boolean;
  onSelect: (type: OrganizationPageType) => void;
}

const TypeCard: React.FC<TypeCardProps> = ({
  type,
  title,
  description,
  Icon,
  selected = false,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={[
        "group w-full text-left rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all duration-200 p-5 flex flex-col gap-3",
        selected
          ? "border-verde-oscuro ring-2 ring-verde-oscuro/30"
          : "border-gray-200 hover:border-verde-claro",
      ].join(" ")}
    >
      <div
        className={[
          "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
          selected
            ? "bg-verde-oscuro text-white"
            : "bg-emerald-50 text-verde-oscuro group-hover:bg-verde-oscuro group-hover:text-white",
        ].join(" ")}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 leading-snug">{description}</p>
      </div>
    </button>
  );
};

export default TypeCard;
