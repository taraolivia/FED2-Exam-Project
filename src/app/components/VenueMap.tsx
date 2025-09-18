"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />,
});

type Props = {
  venue: {
    name: string;
    location?: {
      lat?: number | null;
      lng?: number | null;
      city?: string | null;
      country?: string | null;
      address?: string | null;
    };
  };
};

export default function VenueMap({ venue }: Props) {
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { location } = venue;

  useEffect(() => {
    async function getCoordinates() {
      // If we have exact coordinates, use them
      if (location?.lat && location?.lng) {
        setCoordinates({ lat: location.lat, lng: location.lng });
        setLoading(false);
        return;
      }

      // Try to geocode from city/country
      const query = [location?.city, location?.country]
        .filter(Boolean)
        .join(", ");
      if (query) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
          );
          const data = await response.json();
          if (data[0]) {
            setCoordinates({
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
          } else {
            // Fallback to center of Europe
            setCoordinates({ lat: 50.8503, lng: 4.3517 });
          }
        } catch (error) {
          console.error("Geocoding failed:", error);
          setCoordinates({ lat: 50.8503, lng: 4.3517 });
        }
      } else {
        setCoordinates({ lat: 50.8503, lng: 4.3517 });
      }
      setLoading(false);
    }

    getCoordinates();
  }, [location]);

  const hasExactCoordinates = location?.lat && location?.lng;
  const locationText =
    [location?.address, location?.city, location?.country]
      .filter(Boolean)
      .join(", ") || venue.name;

  if (loading || !coordinates) {
    return (
      <div className="mt-6">
        <h3 className="font-heading text-lg mb-3">Location</h3>
        <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="font-heading text-lg mb-3">Location</h3>

      <div className="bg-background-lighter rounded-lg p-4 mb-4">
        <p className="text-sm text-text/70">📍 {locationText}</p>
        {!hasExactCoordinates && (
          <p className="text-xs text-text/60 mt-1">
            Showing approximate location based on city
          </p>
        )}
      </div>

      <div className="h-64 rounded-lg overflow-hidden border border-text/20">
        <LeafletMap
          lat={coordinates.lat}
          lng={coordinates.lng}
          zoom={hasExactCoordinates ? 15 : 10}
          venueName={venue.name}
          locationText={locationText}
        />
      </div>
    </div>
  );
}
