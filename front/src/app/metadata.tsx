import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Futbolink - La plataforma líder de oportunidades en el mundo del fútbol",
  description: "Futbolink es la plataforma profesional que conecta talento y oportunidades en el mundo del fútbol. Futbolink crea puentes para tu futuro deportivo.",
  keywords: ["futbolink", "fútbol", "empleo deportivo", "oportunidades futbolink", "reclutamiento deportivo", "futbolink plataforma", "futbolink empleo"],
  authors: [{ name: "Futbolink" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://futbolink.net",
    siteName: "Futbolink",
    title: "Futbolink - La plataforma líder de oportunidades en el mundo del fútbol",
    description: "Futbolink conecta talento y oportunidades en el mundo del fútbol profesional. Únete a Futbolink hoy mismo.",
    images: [
      {
        url: "/logoD.png",
        width: 1200,
        height: 630,
        alt: "Logo Futbolink"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Futbolink - La plataforma líder de oportunidades en el mundo del fútbol",
    description: "Futbolink conecta talento y oportunidades en el mundo del fútbol profesional. Únete a Futbolink hoy mismo.",
    images: ["/logoD.png"]
  },
  icons: {
    icon: "/logoD.png",
    shortcut: "/logoD.png",
    apple: "/logoD.png"
  },
  metadataBase: new URL("https://futbolink.net")
};
