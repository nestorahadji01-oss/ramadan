import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ActivationProvider } from "@/contexts/ActivationContext";

export const metadata: Metadata = {
  title: "Ramadan Companion | رمضان مبارك",
  description: "Votre compagnon spirituel pour le mois de Ramadan. Heures de prière, Coran, Tasbih, Azkar, Zakat et plus encore.",
  keywords: ["ramadan", "islam", "prière", "coran", "tasbih", "zakat", "azkar", "muslim"],
  authors: [{ name: "Ramadan Companion" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ramadan",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f0d" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
      </head>
      <body className="antialiased">
        <ActivationProvider>
          {children}
        </ActivationProvider>
      </body>
    </html>
  );
}
