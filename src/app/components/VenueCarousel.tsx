"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Venue } from "@/lib/schemas/venue";
import { VenueCarouselSkeleton } from "./LoadingSkeleton";

// Extract sorting logic to avoid duplication
function sortVenuesByCreatedDate(venues: Venue[]): Venue[] {
  return [...venues].sort((a: Venue, b: Venue) => {
    const aCreated = Date.parse(a.created);
    const bCreated = Date.parse(b.created);
    return bCreated - aCreated;
  });
}

export default function VenueCarousel() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestVenues() {
      try {
        // 1) Get page 1 to discover meta.pageCount
        const base = new URL("/api/holidaze/venues", window.location.origin);
        base.searchParams.set("page", "1");
        base.searchParams.set("limit", "100");

        const res = await fetch(base.toString(), { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const first = await res.json();
        const meta = first.meta;
        const pages = Math.max(meta?.pageCount ?? 1, 1);

        // 2) If only one page, done
        if (pages === 1) {
          const sorted = sortVenuesByCreatedDate(first.data);
          setVenues(sorted.slice(0, 3));
          return;
        }

        // 3) Fetch remaining pages concurrently
        const promises = [];
        for (let p = 2; p <= pages; p++) {
          const u = new URL("/api/holidaze/venues", window.location.origin);
          u.searchParams.set("page", String(p));
          u.searchParams.set("limit", "100");
          promises.push(
            fetch(u.toString(), { cache: "no-store" })
              .then((r) => r.json())
              .catch((err) => {
                console.warn(`Failed to fetch page ${p}:`, err);
                return { data: [] }; // Return empty data on error
              }),
          );
        }

        const rest = await Promise.all(promises);
        // 4) Merge + de-dup by id
        const allData = [first, ...rest].flatMap((r) => r.data);
        const uniqueMap = new Map<string, Venue>();
        for (const v of allData) {
          if (v.id && !uniqueMap.has(v.id)) uniqueMap.set(v.id, v);
        }

        // Sort by created date (newest first) and take top 3
        const sorted = sortVenuesByCreatedDate(Array.from(uniqueMap.values()));

        setVenues(sorted.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch venues:", error);
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
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 transition-colors"
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
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 transition-colors"
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
          <h2 className="font-heading text-[50px] text-accent-darkest text-center hover:text-accent transition-colors cursor-pointer">
            {currentVenue.name}
          </h2>
        </Link>
      </div>
    </section>
  );
}
