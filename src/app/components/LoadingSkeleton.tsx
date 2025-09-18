export function VenueCarouselSkeleton() {
  return (
    <section className="relative h-[600px] bg-background overflow-hidden">
      <div className="relative h-full flex">
        {/* Left skeleton */}
        <div className="flex-1 h-full bg-gray-200 animate-pulse" />

        {/* Center skeleton */}
        <div className="w-[850px] h-full bg-gray-300 animate-pulse" />

        {/* Right skeleton */}
        <div className="flex-1 h-full bg-gray-200 animate-pulse" />
      </div>

      {/* Title overlay skeleton */}
      <div className="absolute top-1/2 left-0 right-0 h-[120px] bg-accent-lightest/70 flex items-center justify-center z-10 transform -translate-y-1/2">
        <div className="h-12 w-64 bg-gray-300 animate-pulse rounded" />
      </div>
    </section>
  );
}

export function VenueCardSkeleton() {
  return (
    <article className="border border-text/10 bg-background shadow-sm rounded-lg overflow-hidden">
      <div className="relative aspect-[4/5] w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]">
        <div className="absolute inset-x-0 bottom-0 z-10 bg-black/40 px-5 py-4">
          <div className="h-6 w-32 bg-white/20 rounded mb-2" />
          <div className="h-px w-40 bg-white/60 mb-1" />
          <div className="h-4 w-24 bg-white/20 rounded" />
        </div>
      </div>
    </article>
  );
}

export function VenuesGridSkeleton() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Search skeleton */}
        <div className="mb-4">
          <div className="h-10 w-64 bg-gray-200 animate-pulse rounded-lg" />
        </div>

        {/* Header skeleton */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-4 w-48 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-lg" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(24)].map((_, i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function BookingsSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-background-lighter rounded-lg p-6">
          <div className="flex gap-6">
            <div className="w-32 h-24 bg-gray-200 animate-pulse rounded-lg" />
            <div className="flex-1">
              <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j}>
                    <div className="h-3 w-16 bg-gray-200 animate-pulse rounded mb-1" />
                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
