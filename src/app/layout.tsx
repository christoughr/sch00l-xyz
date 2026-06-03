import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { AuthProvider } from "@/components/AuthProvider";
import { AgeGate } from "@/components/AgeGate";
import { Footer } from "@/components/Footer";
import { SITE_DOMAIN, SITE_URL } from "@/lib/site";
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
  title: `${SITE_DOMAIN} — AI tutor with measurable learning lift`,
  description:
    "Socratic AI tutor for students. Pre-quiz → tutor → post-quiz → flashcards. See your learning lift %. Free at sch00l.ai/study",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.json",
  applicationName: "sch00l",
  appleWebApp: {
    capable: true,
    title: "sch00l",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: "sch00l.ai — Socratic AI tutor + learning lift",
    description:
      "Pre-quiz → tutor → post-quiz → flashcards. Measure if you actually learned.",
    url: SITE_URL,
    siteName: "sch00l",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "sch00l.ai" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "sch00l.ai — Socratic AI tutor + learning lift",
    description:
      "Pre-quiz → tutor → post-quiz. See your learning lift %. Free to start.",
    images: ["/og-image.png"],
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
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:m-2 focus:rounded-lg focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
            >
              Skip to main content
            </a>
            <Nav />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </AgeGate>
        </AuthProvider>
      </body>
    </html>
  );
}
