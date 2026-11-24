import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { NotificationProvider } from "@/context/NotificationContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Attendlix — Smart School Management ERP Built for Pakistan",
  description:
    "Manage attendance, fees, and parent updates in one lightweight platform—with automatic WhatsApp alerts, offline support, and JazzCash/Easypaisa collection.",
  keywords: [
    "School Management System",
    "Pakistan School ERP",
    "School Attendance App",
    "JazzCash Fee Collection",
    "WhatsApp School Alerts",
    "Attendlix",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth overflow-x-clip">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-[#FAFAFA] text-[#111827] overflow-x-clip w-full selection:bg-emerald-100 selection:text-emerald-900">
        <LanguageProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
