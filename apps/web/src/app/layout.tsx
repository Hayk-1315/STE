// apps/web/src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/providers/wallet";
import NotificationsProvider from "@/providers/notifications";
import AppBackground from "@/components/AppBackground"; // visual wrapper only

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "STE",
  description: "SkyTrade Exchange",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Keep font vars + antialias as before */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Mount toaster/notifications first so toasts are available app-wide */}
        <NotificationsProvider />
        {/* Pure visual background; does not alter app logic */}
        <AppBackground>
          {/* Wallet provider wraps page content exactly as before */}
          <WalletProvider>
            {/* Consistent page gutter + max width */}
            <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-6 py-6">{children}</div>
          </WalletProvider>
        </AppBackground>
      </body>
    </html>
  );
}
