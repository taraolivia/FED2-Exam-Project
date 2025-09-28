/**
 * Root layout component for the Holidaze application
 * 
 * Provides:
 * - Global font configuration (Inter + Marcellus)
 * - SEO metadata and OpenGraph tags
 * - User authentication context
 * - Global navigation and footer
 * - CSS custom properties for design system
 */
import type { Metadata } from "next";
import { Inter, Marcellus } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { UserProvider } from "@/lib/contexts/UserContext";

/** Body font configuration */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/** Heading font configuration */
const marcellus = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Holidaze - Venue Booking Platform",
  description:
    "Discover and book amazing accommodations worldwide. Modern booking platform for travelers and venue managers.",
  keywords: "venue booking, accommodation, travel, hotels, vacation rentals, holidaze",
  authors: [{ name: "Tara Olivia Bjørheim" }],
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "Holidaze - Venue Booking Platform",
    description: "Discover and book amazing accommodations worldwide",
    type: "website",
    siteName: "Holidaze",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Holidaze - Venue Booking Platform",
    description: "Discover and book amazing accommodations worldwide",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${marcellus.variable}`}>
      <body className="antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-accent-darkest px-4 py-2 rounded z-50">
          Skip to main content
        </a>
        <UserProvider>
          <Navbar />
          <main id="main-content">
            {children}
          </main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
