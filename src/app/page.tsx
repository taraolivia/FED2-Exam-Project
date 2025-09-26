import { Suspense } from "react";
import HeroSection from "./components/HeroSection";
import VenueCarousel from "./components/VenueCarousel";
import QuoteSection from "./components/QuoteSection";
import VenuesGrid from "./components/VenuesGrid";
import { ShimmerBox } from "./components/LoadingSkeleton";

/**
 * Homepage component for the Holidaze booking platform
 * 
 * Features:
 * - Hero section with search functionality
 * - Featured venue carousel
 * - Inspirational quote section
 * - Complete venues grid with search and filtering
 * - Loading states with Suspense boundaries
 * 
 * @returns JSX element containing the complete homepage layout
 */
export default function Home() {
  return (
    <>
      <HeroSection />
      <main>
        <VenueCarousel />
        <QuoteSection />
        <Suspense
          fallback={
            <div className="bg-background py-8">
              <div className="mx-auto max-w-6xl px-4">
                <ShimmerBox className="h-64 rounded-lg" />
              </div>
            </div>
          }
        >
          <VenuesGrid />
        </Suspense>
      </main>
    </>
  );
}
