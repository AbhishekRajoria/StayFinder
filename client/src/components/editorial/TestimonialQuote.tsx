import { type ReactNode } from "react";

interface TestimonialQuoteProps {
  quote: ReactNode;
  author: string;
  meta?: string;
}

/**
 * Magazine-style pull quote. Centered, max-w-3xl, italic Fraunces.
 */
export function TestimonialQuote({ quote, author, meta }: TestimonialQuoteProps) {
  return (
    <figure className="max-w-3xl mx-auto text-center">
      <span aria-hidden className="block font-display text-display-lg text-terracotta/40 leading-none mb-6">
        “
      </span>
      <blockquote className="font-display italic text-2xl md:text-3xl leading-snug text-ink">
        {quote}
      </blockquote>
      <figcaption className="mt-10">
        <p className="eyebrow text-ink">{author}</p>
        {meta && <p className="text-sm text-ink3 mt-1">{meta}</p>}
      </figcaption>
    </figure>
  );
}
