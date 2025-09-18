"use client";
import Image from "next/image";
import SearchFieldHero from "./SearchFieldHero";

export default function HeroSection() {
  return (
    <section
      className="bg-cover bg-center bg-no-repeat min-h-[100vh] flex flex-col"
      style={{ backgroundImage: "url('/hero-image-deer.jpg')" }}
      aria-label="Hero"
    >
      <div className="flex-1 flex items-center justify-center">
        <SearchFieldHero />
      </div>

      {/* logo/tekst nederst */}
      <div className="mx-auto w-fit">
        <Image
          aria-hidden
          src="/holidaze-logo-white.png"
          alt="Holidaze logo"
          width={600}
          height={300}
        />
      </div>
    </section>
  );
}
