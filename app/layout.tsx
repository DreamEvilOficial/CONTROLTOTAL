import React from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cargar Fichas YA! | Casino Online Seguro & Rápido",
  description: "La forma más segura y rápida de cargar fichas de casino. Pagos instantáneos, soporte 24/7 y anonimato total garantizado.",
  keywords: ["casino", "fichas", "cargas", "poker", "slots", "apuestas", "seguro", "rápido"],
  icons: [
    { rel: 'icon', url: '/icon.svg' },
    { rel: 'shortcut icon', url: '/icon.svg' },
    { rel: 'apple-touch-icon', url: '/icon.svg' }
  ],
  openGraph: {
    title: "Cargar Fichas YA! - Tu Saldo al Instante",
    description: "Servicio premium de carga de fichas. Operamos con las mejores plataformas. Seguridad y rapidez garantizada.",
    type: "website",
    locale: "es_AR",
    images: [
      {
        url: '/icon.svg', // Ideally a larger OG image, but using icon for now or I can't generate a binary image.
        width: 800,
        height: 600,
        alt: "Cargar Fichas YA Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cargar Fichas YA! - Casino Online",
    description: "Carga fichas en segundos. Soporte personalizado y pagos seguros.",
    images: ['/icon.svg'],
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#10b981", // Emerald-500
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>{children}</body>
    </html>
  );
}
