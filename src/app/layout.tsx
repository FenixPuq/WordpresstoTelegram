import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WordPress to Telegram - Automatiza tus Publicaciones",
  description: "Conecta tu blog WordPress con Telegram y automatiza la publicación de posts en tu canal o grupo.",
  keywords: ["WordPress", "Telegram", "Bot", "Automatización", "Next.js", "TypeScript"],
  authors: [{ name: "WordPress to Telegram" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "WordPress to Telegram",
    description: "Automatiza la publicación de posts de WordPress en Telegram",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WordPress to Telegram",
    description: "Automatiza la publicación de posts de WordPress en Telegram",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
