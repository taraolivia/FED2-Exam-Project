"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { useUser } from "@/lib/contexts/UserContext";
import { useState } from "react";

const HAMBURGER_TRANSFORMS = {
  TOP_OPEN: "rotate-45 translate-y-1",
  MIDDLE_OPEN: "opacity-0",
  BOTTOM_OPEN: "-rotate-45 -translate-y-1",
};

export default function Navbar() {
  const { user, setUser } = useUser();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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
    <nav className="bg-accent-lightest/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-[100]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-3 items-center h-16 md:h-[115px]">
          {/* Left - Venues link */}
          <div className="flex items-center">
            <Link
              href="/#venues"
              onClick={handleVenuesClick}
              className="hidden md:block text-text hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded transition-colors duration-200"
            >
              Venues
            </Link>
          </div>

          {/* Center - Logo */}
          <div className="flex justify-center">
            <Link href="/">
              <Image
                src="/holidaze-logo-dark.png"
                alt="Holidaze"
                width={270}
                height={114}
                className="h-12 md:h-[115px] w-auto"
              />
            </Link>
          </div>

          {/* Right - Auth + Mobile menu */}
          <div className="flex items-center justify-end">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="bg-background-lighter px-3 py-1 rounded-lg text-sm hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
                  >
                    {user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-text/70 hover:text-text focus:text-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded text-sm transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
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

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-background-lighter focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`block w-5 h-0.5 bg-text transition-all ${isOpen ? HAMBURGER_TRANSFORMS.TOP_OPEN : ""}`}
                />
                <span
                  className={`block w-5 h-0.5 bg-text mt-1 transition-all ${isOpen ? HAMBURGER_TRANSFORMS.MIDDLE_OPEN : ""}`}
                />
                <span
                  className={`block w-5 h-0.5 bg-text mt-1 transition-all ${isOpen ? HAMBURGER_TRANSFORMS.BOTTOM_OPEN : ""}`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-text/10 py-4">
            <div className="space-y-3">
              <Link
                href="/#venues"
                onClick={(e) => {
                  handleVenuesClick(e);
                  setIsOpen(false);
                }}
                className="block text-text hover:text-primary transition-colors py-2"
              >
                Venues
              </Link>
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="block text-text hover:text-primary transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile ({user.name})
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block text-text hover:text-primary transition-colors py-2 w-full text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-text hover:text-primary transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="block bg-primary text-accent-darkest px-4 py-2 rounded-lg hover:opacity-90 transition-opacity w-fit"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
