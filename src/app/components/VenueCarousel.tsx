"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Venue } from "@/lib/schemas/venue";
import { VenueCarouselSkeleton } from "./LoadingSkeleton";



export default function VenueCarousel() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestVenues() {
      try {
        // Fetch only what we need for carousel (top 3 newest)
        const base = new URL("/api/holidaze/venues", window.location.origin);
        if (base.hostname !== window.location.hostname) {
          throw new Error("Invalid API endpoint");
        }
        base.searchParams.set("page", "1");
        base.searchParams.set("limit", "3");
        base.searchParams.set("sort", "created");
        base.searchParams.set("sortOrder", "desc");

        const res = await fetch(base.toString(), { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const response = await res.json();

        // Server already sorted by newest, just take the data
        setVenues(response.data);
      } catch {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    }
    fetchLatestVenues();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % venues.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + venues.length) % venues.length);
  };

  if (loading || venues.length === 0) {
    return <VenueCarouselSkeleton />;
  }

  const currentVenue = venues[currentIndex];
  const prevVenue = venues[(currentIndex - 1 + venues.length) % venues.length];
  const nextVenue = venues[(currentIndex + 1) % venues.length];

  return (
    <section className="relative h-[600px] bg-background overflow-hidden">
      {/* Images */}
      <div className="relative h-full flex">
        {/* Left image (partial, with overlay) */}
        <div className="flex-1 h-full transition-all duration-500 ease-in-out">
          <div className="relative w-full h-full">
            <Image
              src={prevVenue.media?.[0]?.url || "/placeholder.jpg"}
              alt={prevVenue.name}
              fill
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-accent-lighter/30" />
          </div>
        </div>

        {/* Center image (full opacity) */}
        <div className="w-[850px] h-full transition-all duration-500 ease-in-out">
          <div className="relative w-full h-full">
            <Image
              src={currentVenue.media?.[0]?.url || "/placeholder.jpg"}
              alt={currentVenue.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Right image (partial, with overlay) */}
        <div className="flex-1 h-full transition-all duration-500 ease-in-out">
          <div className="relative w-full h-full">
            <Image
              src={nextVenue.media?.[0]?.url || "/placeholder.jpg"}
              alt={nextVenue.name}
              fill
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-accent-lighter/30" />
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 transition-colors cursor-pointer"
        aria-label="Previous venue"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 transition-colors cursor-pointer"
        aria-label="Next venue"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Title overlay */}
      <div className="absolute top-1/2 left-0 right-0 h-[120px] bg-accent-lightest/70 flex items-center justify-center z-10 transform -translate-y-1/2">
        <Link href={`/venues/${currentVenue.id}`}>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-[50px] text-accent-darkest text-center hover:text-accent transition-colors cursor-pointer">
            {currentVenue.name}
          </h2>
        </Link>
      </div>
    </section>
  );
}
