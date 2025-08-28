"use client";
import Image from "next/image";
import SearchField from "./SearchFieldHero";

export default function HeroSection() {
  return (
    <section
      className="bg-cover bg-center bg-no-repeat min-h-[100vh] flex flex-col"
      style={{ backgroundImage: "url('/hero-image-deer.jpg')" }}
      aria-label="Hero"
    >
      <SearchField />

      {/* logo/tekst nederst */}
      <div className="mx-auto w-fit mt-auto">
        <Image
          aria-hidden
          src="/holidaze-logo-white.png"
          alt="Globe icon"
          width={600}
          height={300}
        />
      </div>
    </section>
  );
}
