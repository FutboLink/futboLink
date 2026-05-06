"use client";

import { FaCheckCircle, FaArrowRight } from "react-icons/fa";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";
import {
  calculateProfileCompleteness,
  type ProfileFieldStatus,
} from "@/lib/profileCompleteness";
import type { IProfileData } from "@/Interfaces/IUser";

type Props = {
  profile: IProfileData;
  /**
   * Si está presente, los tips son botones que llaman a esta función.
   * Si no, son links a /profile?tab=...#anchor.
   */
  onTipClick?: (field: ProfileFieldStatus) => void;
};

export default function ProfileProgressBar({ profile, onTipClick }: Props) {
  const { isNextIntlEnabled } = useI18nMode();
  const tProfile = useNextIntlTranslations("profileCompleteness");
  const getText = (original: string, key: string) =>
    isNextIntlEnabled ? tProfile.t(key) : original;

  const { percentage, missing } = calculateProfileCompleteness(profile);

  const barColor =
    percentage >= 80
      ? "bg-emerald-500"
      : percentage >= 40
      ? "bg-amber-400"
      : "bg-red-500";
  const textColor =
    percentage >= 80
      ? "text-emerald-700"
      : percentage >= 40
      ? "text-amber-700"
      : "text-red-700";
  const ringColor =
    percentage >= 80
      ? "ring-emerald-100"
      : percentage >= 40
      ? "ring-amber-100"
      : "ring-red-100";

  return (
    <section
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ring-4 ${ringColor}`}
    >
      <header className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {getText("Tu perfil", "title")}
        </h2>
        <span className={`text-2xl font-bold ${textColor}`}>{percentage}%</span>
      </header>

      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {missing.length === 0 ? (
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-700 font-medium">
          <FaCheckCircle className="h-4 w-4" />
          {getText("Tu perfil está completo", "complete")}
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-xs text-gray-500">
            {getText(
              "Te falta cargar para mejorar tu perfil:",
              "missingHint",
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {missing.map((field) => {
              const label = getText(field.label, field.labelKey);
              const className =
                "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors";
              return onTipClick ? (
                <button
                  key={field.key}
                  type="button"
                  onClick={() => onTipClick(field)}
                  className={className}
                >
                  {label}
                  <FaArrowRight className="h-2.5 w-2.5" />
                </button>
              ) : (
                <a
                  key={field.key}
                  href={`/profile?tab=${field.tab}#${field.anchor}`}
                  className={className}
                >
                  {label}
                  <FaArrowRight className="h-2.5 w-2.5" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
