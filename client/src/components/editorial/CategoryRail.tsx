import { type ReactNode, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryRailProps {
  title?: string;
  eyebrow?: string;
  cta?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Horizontal scroll-snap rail with editorial header (eyebrow + title + cta).
 * Children should be a list of equally-widthed cards (typ. ListingCardEditorial).
 * Snaps to start; arrow buttons scroll by 80% of viewport rail width.
 */
export function CategoryRail({
  title,
  eyebrow,
  cta,
  children,
  className,
}: CategoryRailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "l" | "r") => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: (dir === "l" ? -1 : 1) * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className={`container-page ${className ?? ""}`}>
      <div className="flex items-end justify-between gap-6 mb-10 md:mb-14">
        <div>
          {eyebrow && <p className="eyebrow text-ink2 mb-3">{eyebrow}</p>}
          {title && (
            <h2 className="font-display text-display text-ink">{title}</h2>
          )}
        </div>
        <div className="flex items-center gap-3">
          {cta}
          <button
            type="button"
            onClick={() => scroll("l")}
            className="hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 hover:border-ink hover:bg-cream transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("r")}
            className="hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 hover:border-ink hover:bg-cream transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory -mx-6 px-6 md:-mx-8 md:px-8"
      >
        {children}
      </div>
    </section>
  );
}
