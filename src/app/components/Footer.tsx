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
    logout();
    setUser(null);
  };

  const handleVenuesClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      const venuesSection = document.getElementById('venues');
      if (venuesSection) {
        venuesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-primary h-[220px]">
      <div className="mx-auto max-w-6xl px-4 h-full flex flex-col justify-center">
        <div className="grid grid-cols-3 items-center h-16 mb-6">
          {/* Left - Venues link */}
          <div>
            <Link 
              href="/#venues" 
              onClick={handleVenuesClick}
              className="text-accent-darkest hover:text-accent transition-colors"
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
                className="h-auto w-auto"
              />
            </Link>
          </div>

          {/* Right - Auth */}
          <div className="flex items-center gap-3 justify-end">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="bg-background-lighter px-3 py-1 rounded-lg text-sm">
                  {user.name}
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-accent-darkest/70 hover:text-accent-darkest text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-accent-darkest hover:text-accent transition-colors text-sm">
                  Log in
                </Link>
                <Link href="/register" className="bg-accent text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Credit line */}
        <div className="text-center text-accent-darkest text-sm">
          Designed and developed by Tara Olivia Bjørheim in 2025
        </div>
      </div>
    </footer>
  );
}