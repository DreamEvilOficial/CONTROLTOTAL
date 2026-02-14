import React from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CONTROLTOTAL | Carga de Fichas 24/7",
  description: "La plataforma definitiva para gestionar tus cargas de fichas. Seguridad, rapidez y control total sobre tus jugadas.",
  keywords: ["casino", "fichas", "cargas", "poker", "slots", "apuestas", "seguro", "rápido", "controltotal"],
  icons: [
    { rel: 'icon', url: '/icon.svg' },
    { rel: 'shortcut icon', url: '/icon.svg' },
    { rel: 'apple-touch-icon', url: '/icon.svg' }
  ],
  openGraph: {
    title: "CONTROLTOTAL - Tu Saldo al Instante",
    description: "Servicio premium de carga de fichas. Operamos con las mejores plataformas del mercado. Seguridad garantizada.",
    type: "website",
    locale: "es_AR",
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: "CONTROLTOTAL Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CONTROLTOTAL - Carga de Fichas",
    description: "Carga fichas en segundos con seguridad total.",
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
