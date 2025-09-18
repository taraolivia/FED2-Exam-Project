import { Suspense } from "react";
import HeroSection from "./components/HeroSection";
import VenueCarousel from "./components/VenueCarousel";
import QuoteSection from "./components/QuoteSection";
import VenuesGrid from "./components/VenuesGrid";

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
                <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
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
