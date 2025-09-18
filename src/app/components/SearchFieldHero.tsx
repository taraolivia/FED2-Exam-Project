import Image from "next/image";

export default function SearchFieldHero() {
  return (
    <div className="relative mx-auto w-fit min-w-4xl  p-7 flex justify-center bg-accent-lightest/70">
      <form action="/" className="w-full max-w-7xl">
        <div className="relative bg-secondary-lighter">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            {/* Search icon */}
            <Image
              aria-hidden
              src="/icons/search.png"
              alt="Search icon"
              width={30}
              height={30}
            />
          </span>
          <input
            type="search"
            name="q"
            placeholder="Enter a destination or describe your dream travel"
            className="w-full bg-transparent pl-15 pr-40 py-3 text-lg text-gray-600 placeholder-gray-500 focus:outline-none"
            aria-label="Search destinations"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[4px] px-6 py-2 text-sm font-medium tracking-wider bg-primary text-accent-darkest hover:opacity-90"
          >
            SEARCH
          </button>
        </div>
      </form>
    </div>
  );
}
