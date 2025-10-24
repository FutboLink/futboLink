import "@/app/globals.css";
import type { AppProps } from "next/app";
import { TranslationProvider } from "@/components/Context/TranslationContext";
import { UserProvider } from "@/components/Context/UserContext";
import { I18nModeProvider } from "@/components/Context/I18nModeContext";
import NavbarSidebarLayout from "@/components/layout/SidebarLayout";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <I18nModeProvider>
      <UserProvider>
        <TranslationProvider>
          <NavbarSidebarLayout>
            <Component {...pageProps} />
          </NavbarSidebarLayout>
        </TranslationProvider>
      </UserProvider>
    </I18nModeProvider>
  );
}
