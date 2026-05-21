"use client";

import type { OrganizationPageType } from "@/types/organizationPage";

interface PageTypeTagProps {
  type: OrganizationPageType;
  label: string;
  size?: "sm" | "md";
}

const typeStyleMap: Record<OrganizationPageType, string> = {
  CLUB: "bg-blue-50 text-blue-700 border-blue-200",
  ACADEMY: "bg-purple-50 text-purple-700 border-purple-200",
  TOURNAMENT_ORGANIZER: "bg-amber-50 text-amber-700 border-amber-200",
  FORMATION_SCHOOL: "bg-indigo-50 text-indigo-700 border-indigo-200",
  AGENCY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  LEAGUE: "bg-yellow-50 text-yellow-700 border-yellow-200",
  FEDERATION: "bg-rose-50 text-rose-700 border-rose-200",
  NATIONAL_TEAM: "bg-teal-50 text-teal-700 border-teal-200",
};

const PageTypeTag: React.FC<PageTypeTagProps> = ({ type, label, size = "md" }) => {
  const style = typeStyleMap[type] ?? "bg-gray-50 text-gray-700 border-gray-200";
  const sizeClass =
    size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border font-semibold tracking-wide uppercase",
        sizeClass,
        style,
      ].join(" ")}
    >
      {label}
    </span>
  );
};

export default PageTypeTag;
