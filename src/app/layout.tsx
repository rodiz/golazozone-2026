import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GolazoZone 2026",
    template: "%s | GolazoZone 2026",
  },
  description: "La polla mundialista más completa del FIFA World Cup 2026. Pronostica, compite y gana.",
  keywords: ["FIFA 2026", "mundial", "polla mundialista", "pronósticos", "fútbol"],
  authors: [{ name: "GolazoZone 2026" }],
  openGraph: {
    title: "GolazoZone 2026",
    description: "La polla mundialista más completa del FIFA World Cup 2026",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A3C6E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
