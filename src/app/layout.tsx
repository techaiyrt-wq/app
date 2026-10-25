import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Sora, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";
import { getSettings } from "@/lib/settings";

/** Lê o tema guardado; se a base de dados não responder, usa o padrão. */
async function themeAttrs() {
  try {
    const s = await getSettings();
    return {
      accent: s.accent,
      background: s.background || "paper",
      backgroundVivid: s.backgroundVivid,
      density: s.density || "normal",
    };
  } catch {
    return { accent: "verde", background: "paper", backgroundVivid: false, density: "normal" };
  }
}

const sora = Sora({ subsets: ["latin"], variable: "--font-display" });
const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Nexo — tarefas com IA no iPhone",
  description:
    "Inbox de tarefas com ChatGPT, Claude e Gemini, sincronizada com o teu dashboard. App instalável, sem App Store.",
  applicationName: "Nexo",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nexo",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f5f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1b26" },
  ],
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const theme = await themeAttrs();
  return (
    <html
      lang="pt"
      data-accent={theme.accent}
      data-bg={theme.background}
      data-bg-vivid={theme.backgroundVivid ? "true" : "false"}
      data-density={theme.density}
      className={`${sora.variable} ${plex.variable} ${mono.variable}`}
    >
      <body className="antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}