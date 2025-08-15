import "@/app/globals.css";
import type { AppProps } from "next/app";
import { TranslationProvider } from "@/components/Context/TranslationContext";
import { UserProvider } from "@/components/Context/UserContext";
import NavbarSidebarLayout from "@/components/layout/SidebarLayout";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <TranslationProvider>
        <NavbarSidebarLayout>
          <Component {...pageProps} />
        </NavbarSidebarLayout>
      </TranslationProvider>
    </UserProvider>
  );
}
