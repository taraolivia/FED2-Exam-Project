"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { useUser } from "@/lib/contexts/UserContext";

export default function Footer() {
  const { user, setUser } = useUser();
  const pathname = usePathname();

  const handleLogout = () => {
    try {
      logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null); // Clear user state even if logout fails
    }
  };

  const handleVenuesClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      const venuesSection = document.getElementById("venues");
      if (venuesSection) {
        venuesSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-primary py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:items-center mb-8">
          {/* Center - Logo (first on mobile) */}
          <div className="flex justify-center md:order-2">
            <Link href="/">
              <Image
                src="/holidaze-logo-dark.png"
                alt="Holidaze"
                width={270}
                height={114}
                className="h-auto w-auto"
              />
            </Link>
          </div>

          {/* Left - Venues link */}
          <div className="flex justify-center md:justify-start md:order-1">
            <Link
              href="/#venues"
              onClick={handleVenuesClick}
              className="text-accent-darkest hover:text-accent transition-colors"
            >
              Venues
            </Link>
          </div>

          {/* Right - Auth */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center md:justify-end md:order-3">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="bg-background-lighter px-3 py-1 rounded-lg text-sm hover:bg-background transition-colors"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-accent-darkest/70 hover:text-accent-darkest text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-accent-darkest hover:text-accent transition-colors text-sm"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-accent text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Credit line */}
        <div className="text-center text-accent-darkest text-sm mt-6">
          Designed and developed by Tara Olivia Bjørheim in 2025
        </div>
      </div>
    </footer>
  );
}
