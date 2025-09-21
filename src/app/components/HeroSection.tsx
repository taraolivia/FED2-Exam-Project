"use client";
import Image from "next/image";
import SearchFieldHero from "./SearchFieldHero";

export default function HeroSection() {
  return (
    <section
      className="bg-cover bg-center bg-no-repeat min-h-screen flex flex-col px-4 py-20"
      style={{ backgroundImage: "url('/hero-image-deer.jpg')" }}
      aria-label="Hero"
    >
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full">
          <SearchFieldHero />
        </div>
      </div>

      {/* logo/tekst nederst */}
      <div className="mx-auto w-fit">
        <Image
          aria-hidden
          src="/holidaze-logo-white.png"
          alt="Holidaze logo"
          width={600}
          height={300}
          className="w-64 sm:w-80 md:w-96 lg:w-[600px] h-auto"
        />
      </div>
    </section>
  );
}
