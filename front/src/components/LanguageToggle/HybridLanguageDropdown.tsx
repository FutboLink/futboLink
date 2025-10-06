"use client";

import React from "react";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import LanguageDropdown from "./LanguageDropdown";
import NextIntlLanguageDropdown from "./NextIntlLanguageDropdown";

const HybridLanguageDropdown: React.FC = () => {
  const { isNextIntlEnabled } = useI18nMode();
  
  if (isNextIntlEnabled) {
    return <NextIntlLanguageDropdown />;
  }
  
  return <LanguageDropdown />;
};

export default HybridLanguageDropdown;
