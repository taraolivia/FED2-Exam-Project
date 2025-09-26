/**
 * Hero search field component with venue search functionality
 */
import Image from "next/image";

export default function SearchFieldHero() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    if (query?.trim()) {
      const url = new URL("/", window.location.origin);
      url.searchParams.set("q", query.trim());
      window.location.href = url.toString();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2">
      <div className="bg-accent-lightest/80 backdrop-blur-sm rounded-lg p-4">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative bg-secondary-lighter rounded-lg overflow-hidden">
            <span className="pointer-events-none absolute left-3 md:left-4 top-1/2 -translate-y-1/2">
              <Image
                aria-hidden
                src="/icons/search.png"
                alt="Search icon"
                width={24}
                height={24}
                className="w-5 h-5 md:w-6 md:h-6"
              />
            </span>
            <input
              type="search"
              name="q"
              placeholder="Find your dream venue"
              className="w-full bg-transparent pl-12 md:pl-14 pr-20 py-3 md:py-4 text-lg md:text-xl text-accent placeholder-accent-lighter focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
              aria-label="Search destinations"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-4 py-2 text-sm font-medium bg-primary text-accent-darkest hover:bg-primary/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              SEARCH
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
