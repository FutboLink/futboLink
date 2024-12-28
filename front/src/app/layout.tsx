/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Navbar from "@/components/navbar/navbarHome";
import Footer from "@/components/Footer/footer";
import Navbar from "@/components/navbar/navbar";
import { usePathname } from "next/navigation"; // Importar usePathname
import { metadata } from "../app/metada"; // Importar metadata desde el archivo separado
import SocialButton from "@/components/SocialButton/SocialButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // Obtener la ruta actual

  // Condición para no mostrar Navbar en la página de inicio
  const showNavbar = pathname !== "/"; // Excluir Navbar en la página de inicio

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {showNavbar && <Navbar />}{" "}
        <div>{children}</div>
        <SocialButton />
        <Footer />
      </body>
    </html>
  );
}
