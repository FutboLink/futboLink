"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

type Tone = "danger" | "primary";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: Tone;
  withReason?: boolean;
  reasonPlaceholder?: string;
  reasonLabel?: string;
  busy?: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
};

export default function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "primary",
  withReason = false,
  reasonPlaceholder,
  reasonLabel,
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  if (!open) return null;

  const confirmClasses =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-verde-oscuro hover:bg-verde-mas-claro text-white";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={busy ? undefined : onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 pt-5">
          <h2 className="font-bold text-gray-800 text-lg">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
            aria-label="Cerrar"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
          {withReason && (
            <div className="flex flex-col gap-1.5">
              {reasonLabel && (
                <label className="text-xs font-semibold text-gray-700">
                  {reasonLabel}
                </label>
              )}
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={reasonPlaceholder}
                rows={3}
                className="border border-gray-200 rounded-lg p-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-sm font-semibold text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(withReason ? reason.trim() : undefined)}
            disabled={busy}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
