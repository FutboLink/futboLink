"use client";

import React from "react";
import { FaGlobe } from "react-icons/fa";
import { useTranslation } from "@/components/Context/TranslationContext";

interface LanguageToggleProps {
  className?: string;
  position?: "fixed" | "absolute" | "relative";
}

// This component is deprecated and replaced by LanguageDropdown
// It's kept for backward compatibility but will return null
const LanguageToggle: React.FC<LanguageToggleProps> = () => {
  return null; // Return nothing as this component is deprecated
};

export default LanguageToggle; 