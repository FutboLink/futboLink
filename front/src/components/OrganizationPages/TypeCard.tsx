"use client";

import type { IconType } from "react-icons";
import type { OrganizationPageType } from "@/types/organizationPage";

export type TypeCardAccent =
  | "emerald"
  | "orange"
  | "teal"
  | "amber"
  | "sky"
  | "rose"
  | "violet";

interface TypeCardProps {
  type: OrganizationPageType;
  title: string;
  description: string;
  Icon: IconType;
  selected?: boolean;
  accent?: TypeCardAccent;
  onSelect: (type: OrganizationPageType) => void;
}

const ACCENT_MAP: Record<
  TypeCardAccent,
  { bg: string; text: string; ring: string; border: string }
> = {
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    ring: "ring-emerald-500/30",
    border: "border-emerald-500",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-500",
    ring: "ring-orange-500/30",
    border: "border-orange-500",
  },
  teal: {
    bg: "bg-teal-50",
    text: "text-teal-600",
    ring: "ring-teal-500/30",
    border: "border-teal-500",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-500",
    ring: "ring-amber-500/30",
    border: "border-amber-500",
  },
  sky: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    ring: "ring-sky-500/30",
    border: "border-sky-500",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    ring: "ring-rose-500/30",
    border: "border-rose-500",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    ring: "ring-violet-500/30",
    border: "border-violet-500",
  },
};

const TypeCard: React.FC<TypeCardProps> = ({
  type,
  title,
  description,
  Icon,
  selected = false,
  accent = "emerald",
  onSelect,
}) => {
  const a = ACCENT_MAP[accent];

  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={[
        "group w-full text-left rounded-2xl border bg-white shadow-sm transition-all duration-200 p-5 flex flex-col gap-3",
        selected
          ? `${a.border} ring-2 ${a.ring} shadow-md`
          : "border-gray-200 hover:border-gray-400 hover:-translate-y-0.5 hover:shadow-lg",
      ].join(" ")}
      aria-pressed={selected}
    >
      <div
        className={[
          "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
          a.bg,
          a.text,
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
