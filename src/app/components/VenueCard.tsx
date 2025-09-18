import Link from "next/link";
import Image from "next/image";
import type { Venue } from "@/lib/schemas/venue";

type Props = { venue: Venue };

export default function VenueCard({ venue }: Props) {
  const img = venue.media?.[0];
  const title = venue.name;
  const location =
    [venue.location?.city, venue.location?.country]
      .filter(Boolean)
      .join(", ") || "—";

  return (
    <article className="group relative overflow-hidden border border-text/10 bg-background shadow-sm transition-transform focus-within:-translate-y-0.5">
      {/* Clickable area */}
      <Link
        href={`/venues/${venue.id}`}
        className="block outline-none"
        aria-label={`View ${title}`}
      >
        {/* Image */}
        <div className="relative aspect-[4/5] w-full bg-secondary-lighter">
          {img?.url ? (
            <Image
              src={img.url}
              alt={img.alt ?? title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-text/60">
              No image
            </div>
          )}

          {/* Title bar (always visible) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-accent/60 px-5 py-4 backdrop-blur-[1px] md:group-hover:opacity-0 md:group-focus-within:opacity-0 ">
            <h3 className="font-heading text-lg tracking-wide text-white">
              {title}
            </h3>
            <div className="mt-1 h-px w-40 bg-white/60" />
            <p className="mt-1 text-sm text-white/80">{location}</p>
          </div>

          {/* Details panel (hover/focus reveal on md+) */}
          <div
            className="
              pointer-events-none absolute inset-x-0 bottom-0 z-40
              bg-gradient-to-t from-secondary-darker/55 to-transparent
              opacity-100
              md:translate-y-6 md:opacity-0
              md:group-hover:translate-y-0 md:group-hover:opacity-100
              md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100
            "
            aria-hidden="true"
          >
            <div className="w-full bg-accent/80 px-5 py-4 backdrop-blur-[1px]">
              <ul className="space-y-1 text-sm text-white/90 mb-4">
                <li>
                  <span className="opacity-80">price</span> • ${venue.price}
                  /night
                </li>
                <li>
                  <span className="opacity-80">max guests</span> •{" "}
                  {venue.maxGuests}
                </li>
                <li>
                  <span className="opacity-80">rating</span> •{" "}
                  {venue.rating ?? "—"}
                </li>
              </ul>

              <h4 className="font-heading text-lg tracking-wide text-white">{title}</h4>
              <div className="mt-1 h-px w-40 bg-white/60" />
              <p className="mt-1 text-sm text-white/80">{location}</p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
