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
  keywords: "venue booking, accommodation, travel, hotels, vacation rentals",
  authors: [{ name: "Tara Olivia Bjørheim" }],
  openGraph: {
    title: "Holidaze - Venue Booking Platform",
    description: "Discover and book amazing accommodations worldwide",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${marcellus.variable}`}>
      <body className="antialiased">
        <UserProvider>
          <Navbar />
          {children}
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
