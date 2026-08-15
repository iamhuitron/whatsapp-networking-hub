import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsApp Networking Hub",
  description:
    "Convierte el chat de tu comunidad de WhatsApp en un directorio de networking profesional. 100% procesado en tu navegador, sin servidores, sin cuentas.",
  openGraph: {
    title: "WhatsApp Networking Hub",
    description:
      "Convierte el chat de tu comunidad de WhatsApp en un directorio de networking profesional. Procesamiento 100% local.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
