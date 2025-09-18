"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { useUser } from "@/lib/contexts/UserContext";

export default function Navbar() {
  const { user, setUser } = useUser();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    setUser(null);
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
    <nav className="bg-accent-lightest/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Left - Navigation links */}
          <div className="flex items-center gap-6">
            <Link
              href="/#venues"
              onClick={handleVenuesClick}
              className="text-text hover:text-primary transition-colors"
            >
              Venues
            </Link>
            {user && (
              <>
                <Link
                  href="/bookings"
                  className="text-text hover:text-primary transition-colors"
                >
                  My Bookings
                </Link>
                {user.venueManager && (
                  <Link
                    href="/manage-venues"
                    className="text-text hover:text-primary transition-colors"
                  >
                    My Venues
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Center - Logo */}
          <div className="flex justify-center">
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

          {/* Right - Auth */}
          <div className="flex items-center gap-3 justify-end">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="bg-background-lighter px-3 py-1 rounded-lg text-sm hover:bg-background transition-colors"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-text/70 hover:text-text text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-text hover:text-primary transition-colors text-sm"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-primary text-accent-darkest px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
