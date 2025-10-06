"use client";

import { useUserContext } from "@/hook/useUserContext";
import { useI18nMode } from "@/components/Context/I18nModeContext";
import { useNextIntlTranslations } from "@/hooks/useNextIntlTranslations";
import NavbarAdmin from "./navbarAdmin";
import NavbarRoles from "./navbarRoles";

function Navbar() {
  const { role } = useUserContext();
  const { isNextIntlEnabled } = useI18nMode();
  const tNav = useNextIntlTranslations('navigation');

  // Función para obtener el texto traducido o el texto original
  const getText = (originalText: string, translatedKey: string) => {
    return isNextIntlEnabled ? tNav.t(translatedKey) : originalText;
  };
  if (role === "") {
    return <NavbarRoles />;
  }
  console.log("Navbar - Role:", role);

  if (!role) {
    return <NavbarRoles />;
  }

  // Enlaces de navegación con traducciones
  const links = [
    { name: getText("Inicio", "home"), href: "/" },
    { name: getText("Sobre Futbolink", "aboutFutbolink"), href: "/about" },
    { name: getText("Ofertas", "offers"), href: "/jobs" },
    { name: getText("Cursos", "courses"), href: "/cursos" },
    { name: getText("Casos de Éxito", "successCases"), href: "/success-cases" },
    { name: getText("Contacto", "contact"), href: "/contact" },
  ];

  return role === "ADMIN" ? <NavbarAdmin /> : <NavbarRoles />;
}

export default Navbar;
