import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@fontsource/inter/';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/700.css';
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/Navbar";
import Topbar from "@/components/Topbar";
import ReduxProvider from "@/store/Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <Topbar />
          <Navbar />
          {children}
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  );
}
