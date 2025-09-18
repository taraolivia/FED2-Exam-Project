import { notFound } from "next/navigation";
import Image from "next/image";
import type { Venue } from "@/lib/schemas/venue";
import BookingForm from "@/app/components/BookingForm";
import VenueMap from "@/app/components/VenueMap";

async function getVenue(id: string): Promise<Venue | null> {
  try {
    const res = await fetch(`https://v2.api.noroff.dev/holidaze/venues/${id}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export default async function VenuePage({ params }: { params: { id: string } }) {
  const venue = await getVenue(params.id);
  
  if (!venue) {
    notFound();
  }

  const img = venue.media?.[0];
  const location = [venue.location?.city, venue.location?.country]
    .filter(Boolean)
    .join(", ") || "—";

  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Image */}
        <div className="relative aspect-[16/9] w-full bg-secondary-lighter rounded-lg overflow-hidden mb-6">
          {img?.url ? (
            <Image
              src={img.url}
              alt={img.alt ?? venue.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-text/60">
              No image available
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h1 className="font-heading text-4xl text-text mb-2">{venue.name}</h1>
            <p className="text-text/80">{location}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="font-heading text-xl mb-3">Description</h2>
              <p className="text-text/80 leading-relaxed">{venue.description}</p>
            </div>

            <div className="bg-background-lighter rounded-lg p-6">
              <h3 className="font-heading text-lg mb-4">Details</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-text/70">Price:</span> ${venue.price}/night
                </li>
                <li>
                  <span className="text-text/70">Max guests:</span> {venue.maxGuests}
                </li>
                <li>
                  <span className="text-text/70">Rating:</span> {venue.rating ?? "—"}
                </li>
              </ul>

              {venue.meta && (
                <>
                  <h4 className="font-heading text-base mt-4 mb-2">Amenities</h4>
                  <ul className="space-y-1 text-sm">
                    {venue.meta.wifi && <li>• WiFi</li>}
                    {venue.meta.parking && <li>• Parking</li>}
                    {venue.meta.breakfast && <li>• Breakfast</li>}
                    {venue.meta.pets && <li>• Pets allowed</li>}
                  </ul>
                </>
              )}
            </div>
          </div>
          
          {/* Map */}
          <VenueMap venue={venue} />
          
          {/* Booking Form */}
          <div className="mt-8">
            <BookingForm venue={venue} />
          </div>
        </div>
      </div>
    </main>
  );
}