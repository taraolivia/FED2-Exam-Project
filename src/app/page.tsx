import Image from "next/image";
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
        <VenuesGrid />
      </main>
    </>
  );
}
