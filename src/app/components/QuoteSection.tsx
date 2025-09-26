/**
 * Inspirational quote section component
 */
export default function QuoteSection() {
  return (
    <section aria-label="Quote section" className="bg-primary-lighter">
      <div className="mx-auto font-heading max-w-4xl px-4 py-10">
        <figure className="text-center">
          <blockquote className="text-lg text-text">
            “Wherever you go becomes a part of you somehow.”
          </blockquote>
          <figcaption className="mt-1 text-base text-text">
            — Anita Desai
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
