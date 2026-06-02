import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { AuthProvider } from "@/components/AuthProvider";
import { AgeGate } from "@/components/AgeGate";
import { Footer } from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "sch00l.xyz — AI that helps you actually study",
  description:
    "Student-first AI study partner. Socratic tutoring, streaks, and mastery tracking — built to learn, not cheat.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://sch00l.xyz"
  ),
  openGraph: {
    title: "sch00l.xyz",
    description: "AI dedicated to students who study.",
    url: "https://sch00l.xyz",
    siteName: "sch00l",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <AgeGate>
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
          </AgeGate>
        </AuthProvider>
      </body>
    </html>
  );
}
