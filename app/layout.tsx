import React from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://cargarfichasya.vercel.app'),
  title: "CONTROLTOTAL | Carga de Fichas 24/7",
  description: "La plataforma definitiva para gestionar tus cargas de fichas. Seguridad, rapidez y control total sobre tus jugadas.",
  keywords: ["casino", "fichas", "cargas", "poker", "slots", "apuestas", "seguro", "rápido", "controltotal"],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: [
      { url: '/icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: "CONTROLTOTAL - Tu Saldo al Instante",
    description: "Servicio premium de carga de fichas. Operamos con las mejores plataformas del mercado. Seguridad garantizada.",
    type: "website",
    url: 'https://cargarfichasya.vercel.app',
    siteName: 'CONTROLTOTAL',
    images: [
      {
        url: '/icon.svg',
        width: 1200,
        height: 630,
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
