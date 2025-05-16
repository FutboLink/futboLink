/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

import Footer from "@/components/Footer/footer";
import Navbar from "@/components/navbar/navbar";
import { usePathname } from "next/navigation"; // Importar usePathname
import { metadata } from "../app/metada"; // Importar metadata desde el archivo separado
import SocialButton from "@/components/SocialButton/SocialButton";
import { UserProvider } from "@/components/Context/UserContext";
import { TranslationProvider } from "@/components/Context/TranslationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metaData = metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Obtener la ruta actual

  return (
    <html lang="en">
      <head>
        <title>{String(metadata.title ?? "Futbolink")}</title>
        <meta
          name="description"
          content={String(
            metadata.description ??
              "Creando oportunidades para tu futuro en el fútbol"
          )}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased hover:scale`}
      >
        <UserProvider>
          <TranslationProvider>
            <Navbar />
            <div>{children}</div>
            <SocialButton />
            <Footer />
          </TranslationProvider>
        </UserProvider>
      </body>
    </html>
  );
}
