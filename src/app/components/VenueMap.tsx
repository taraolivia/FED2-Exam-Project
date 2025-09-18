"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
) as any;
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
) as any;
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
) as any;
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
}) as any;

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
  const [isClient, setIsClient] = useState(false);
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { location } = venue;

  useEffect(() => {
    setIsClient(true);
    // Fix for default markers in Next.js
    if (typeof window !== "undefined") {
      import("leaflet").then((L: any) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
      });
      require("leaflet/dist/leaflet.css");
    }
  }, []);

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

    if (isClient) {
      getCoordinates();
    }
  }, [isClient, location]);

  const hasExactCoordinates = location?.lat && location?.lng;

  const locationText =
    [location?.address, location?.city, location?.country]
      .filter(Boolean)
      .join(", ") || venue.name;

  if (!isClient || loading || !coordinates) {
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
        <MapContainer
          center={[coordinates.lat, coordinates.lng]}
          zoom={hasExactCoordinates ? 15 : 10}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coordinates.lat, coordinates.lng]}>
            <Popup>
              <div className="text-center">
                <strong>{venue.name}</strong>
                {locationText && (
                  <p className="text-sm text-gray-600 mt-1">{locationText}</p>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
