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
import { UserProvider } from "@/components/Context/UserContext";

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

 

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
         <Navbar />
        <div>{children}</div>
        <SocialButton />
        <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
