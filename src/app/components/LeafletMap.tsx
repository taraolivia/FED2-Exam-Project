"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

type Props = {
  lat: number;
  lng: number;
  zoom: number;
  venueName: string;
  locationText: string;
};

export default function LeafletMap({
  lat,
  lng,
  zoom,
  venueName,
  locationText,
}: Props) {
  useEffect(() => {
    // Fix for default markers
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete L.Icon.Default.prototype._getIconUrl;
      const ICON_URLS = {
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      };
      L.Icon.Default.mergeOptions(ICON_URLS);
    }
  }, []);

  // Validate coordinates
  const isValidLat = lat >= -90 && lat <= 90;
  const isValidLng = lng >= -180 && lng <= 180;

  if (!isValidLat || !isValidLng) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Invalid coordinates</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>
          <div className="text-center">
            <strong>{venueName}</strong>
            {locationText && (
              <p className="text-sm text-gray-600 mt-1">{locationText}</p>
            )}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
