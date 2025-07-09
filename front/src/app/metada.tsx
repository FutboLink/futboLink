import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Futbolink - Oportunidades en el mundo del fútbol",
  description: "Plataforma profesional que conecta talento y oportunidades en el mundo del fútbol. Creando puentes para tu futuro deportivo.",
  keywords: ["fútbol", "empleo deportivo", "oportunidades fútbol", "reclutamiento deportivo", "futbolink"],
  authors: [{ name: "Futbolink" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://futbolink.com",
    siteName: "Futbolink",
    title: "Futbolink - Oportunidades en el mundo del fútbol",
    description: "Conectando talento y oportunidades en el mundo del fútbol profesional",
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
    title: "Futbolink - Oportunidades en el mundo del fútbol",
    description: "Conectando talento y oportunidades en el mundo del fútbol profesional",
    images: ["/logoD.png"]
  },
  icons: {
    icon: "/logoD.png",
    shortcut: "/logoD.png",
    apple: "/logoD.png"
  },
  metadataBase: new URL("https://futbolink.com")
}; 