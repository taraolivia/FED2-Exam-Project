const SHIMMER_CLASSES =
  "bg-gradient-to-r from-secondary-lighter via-background-lighter to-secondary-lighter bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]";

export function ShimmerBox({ className = "" }: { className?: string }) {
  const classes = className
    ? `${SHIMMER_CLASSES} ${className}`
    : SHIMMER_CLASSES;
  return <div className={classes} />;
}

export function VenueCarouselSkeleton() {
  return (
    <section className="relative h-[600px] bg-background overflow-hidden">
      <div className="relative h-full flex">
        {/* Left skeleton */}
        <ShimmerBox className="flex-1 h-full" />

        {/* Center skeleton */}
        <ShimmerBox className="max-w-[850px] h-full" />

        {/* Right skeleton */}
        <ShimmerBox className="flex-1 h-full" />
      </div>

      {/* Title overlay skeleton */}
      <div className="absolute top-1/2 left-0 right-0 h-[120px] bg-accent-lightest/70 flex items-center justify-center z-10 transform -translate-y-1/2">
        <ShimmerBox className="h-12 w-64 rounded" />
      </div>
    </section>
  );
}

export function VenueCardSkeleton() {
  return (
    <article className="border border-text/10 bg-background shadow-sm overflow-hidden">
      <div className="relative aspect-[4/5] w-full">
        <ShimmerBox className="absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 z-10 bg-accent/60 px-5 py-4">
          <div className="h-5 w-32 bg-white/20 rounded mb-2" />
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
        {/* Header skeleton */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <ShimmerBox className="h-8 w-32 rounded mb-4" />
            <ShimmerBox className="h-10 w-80 rounded-lg mb-2" />
            <ShimmerBox className="h-4 w-48 rounded" />
          </div>
          <ShimmerBox className="h-10 w-48 rounded-lg" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
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
            <ShimmerBox className="w-32 h-24 rounded-lg" />
            <div className="flex-1">
              <ShimmerBox className="h-6 w-48 rounded mb-2" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j}>
                    <ShimmerBox className="h-3 w-16 rounded mb-1" />
                    <ShimmerBox className="h-4 w-20 rounded" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <ShimmerBox className="h-4 w-16 rounded" />
                <ShimmerBox className="h-4 w-20 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-background-lighter rounded-lg overflow-hidden mb-8">
      {/* Banner skeleton */}
      <ShimmerBox className="h-32" />

      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar skeleton */}
          <ShimmerBox className="w-24 h-24 rounded-full mx-auto sm:mx-0" />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 mb-2">
              <ShimmerBox className="h-8 w-32 rounded" />
              <ShimmerBox className="h-6 w-24 rounded-full mx-auto sm:mx-0 mt-2 sm:mt-0" />
            </div>
            <ShimmerBox className="h-4 w-48 rounded mb-4" />
            <ShimmerBox className="h-4 w-64 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function VenueDetailSkeleton() {
  return (
    <main className="min-h-screen bg-background pt-20 md:pt-32">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header skeleton */}
        <ShimmerBox className="h-10 w-64 rounded mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image skeleton */}
            <ShimmerBox className="aspect-video rounded-lg" />

            {/* Details skeleton */}
            <div className="bg-background-lighter rounded-lg p-6 space-y-4">
              <ShimmerBox className="h-6 w-48 rounded" />
              <ShimmerBox className="h-4 w-full rounded" />
              <ShimmerBox className="h-4 w-3/4 rounded" />
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="bg-background-lighter rounded-lg p-6 space-y-4">
            <ShimmerBox className="h-6 w-32 rounded" />
            <ShimmerBox className="h-32 rounded" />
            <ShimmerBox className="h-10 w-full rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}
