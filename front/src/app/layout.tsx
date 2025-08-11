/* eslint-disable @typescript-eslint/no-unused-vars */
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

import Footer from "@/components/Footer/footer";
import Navbar from "@/components/navbar/navbar";
import { metadata } from "./metadata"; // Importar metadata desde el archivo separado
import SocialButton from "@/components/SocialButton/SocialButton";
import { UserProvider } from "@/components/Context/UserContext";
import { TranslationProvider } from "@/components/Context/TranslationContext";
import ToastContainer from "@/components/ToastContainer";
import { metadata } from "./metadata"; // Importar metadata desde el archivo separado

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
  const keywordsString = Array.isArray(metadata.keywords) 
    ? metadata.keywords.join(", ") 
    : "fútbol, empleo deportivo, oportunidades fútbol";

  return (
    <html lang="es">
      <head>
        <title>{String(metadata.title ?? "Futbolink")}</title>
        <meta
          name="description"
          content={String(
            metadata.description ??
              "Creando oportunidades para tu futuro en el fútbol"
          )}
        />
        <meta name="keywords" content={keywordsString} />
        <meta property="og:title" content={String(metadata.openGraph?.title)} />
        <meta
          property="og:description"
          content={String(metadata.openGraph?.description)}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://futbolink.net" />
        <meta property="og:image" content="https://futbolink.net/logoD.png" />
        <meta property="og:site_name" content="Futbolink" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={String(metadata.twitter?.title)} />
        <meta
          name="twitter:description"
          content={String(metadata.twitter?.description)}
        />
        <meta name="twitter:image" content="https://futbolink.net/logoD.png" />

        {/* Favicons */}
        <link rel="icon" href="/logoD.png" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logoD.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logoD.png" />
        <link rel="apple-touch-icon" href="/logoD.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileImage" content="/logoD.png" />
        <meta name="msapplication-TileColor" content="#1d5126" />
        <meta name="theme-color" content="#1d5126" />

        {/* Preconnect con Cloudinary para mejorar carga de imágenes */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
<<<<<<< HEAD
        <link rel="canonical" href="https://futbolink.net/" />
=======

>>>>>>> main
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased hover:scale`}
      >
        <UserProvider>
          <TranslationProvider>
            {/* <Navbar /> */}
            <NavbarSidebarLayout>
              <div>{children}</div>
            </NavbarSidebarLayout>
            <SocialButton />
            <Footer />
            <ToastContainer />
          </TranslationProvider>
        </UserProvider>
      </body>
    </html>
  );
}
