import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/providers/wallet";
import NotificationsProvider from "@/providers/notifications";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "STE",
  description: "SkyTrade Exchange",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Monta el Toaster primero para que los toast estén disponibles globalmente */}
        <NotificationsProvider />
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
