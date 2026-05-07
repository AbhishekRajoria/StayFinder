import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";

interface ImageCollageProps {
  images: string[];
  alt: string;
}

/**
 * Editorial image collage — 1 large left + 4 small right (2x2). All clickable
 * to open a fullscreen lightbox. The first 5 images are shown in the grid;
 * extras are accessible via the lightbox.
 *
 * Mobile: collapses to a single 4:3 image with a "View all (N)" overlay button
 * that opens the lightbox.
 */
export function ImageCollage({ images, alt }: ImageCollageProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const prefersReduced = useReducedMotion();

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/9] rounded-sm bg-bone flex items-center justify-center text-ink3">
        No images
      </div>
    );
  }

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };
  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  // Take up to 5 for the desktop grid
  const grid = images.slice(0, 5);

  return (
    <>
      {/* Mobile: single image with overlay button */}
      <div className="md:hidden relative aspect-[4/3] rounded-sm overflow-hidden bg-bone group">
        <button
          type="button"
          onClick={() => openAt(0)}
          className="block absolute inset-0"
          aria-label="View photos"
        >
          <img
            src={images[0]}
            alt={alt}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </button>
        <button
          type="button"
          onClick={() => openAt(0)}
          className="absolute bottom-3 right-3 bg-cream/95 text-ink eyebrow rounded-full px-4 py-2 backdrop-blur"
        >
          View all {images.length}
        </button>
      </div>

      {/* Desktop: 1 large + 2x2 small */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 h-[480px] gap-2 rounded-sm overflow-hidden">
        <button
          type="button"
          onClick={() => openAt(0)}
          className="col-span-2 row-span-2 group relative bg-bone overflow-hidden"
        >
          <img
            src={grid[0]}
            alt={`${alt}`}
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </button>

        {[1, 2, 3, 4].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => openAt(i)}
            disabled={!grid[i]}
            className="group relative bg-bone overflow-hidden disabled:opacity-60"
          >
            {grid[i] ? (
              <img
                src={grid[i]}
                alt={`${alt} — ${i + 1}`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            ) : null}
          </button>
        ))}

        {/* "View all" button overlaid bottom-right of grid */}
        {images.length > 5 && (
          <button
            type="button"
            onClick={() => openAt(0)}
            className="absolute bottom-4 right-4 bg-cream/95 text-ink eyebrow rounded-full px-4 py-2 flex items-center gap-2 backdrop-blur shadow-card hover:bg-cream"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            View all {images.length}
          </button>
        )}
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-ink/95 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "ArrowRight") next();
              if (e.key === "ArrowLeft") prev();
            }}
            tabIndex={-1}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 text-cream/80 hover:text-cream"
              aria-label="Close"
            >
              <X className="h-7 w-7" />
            </button>

            <button
              type="button"
              onClick={prev}
              className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-cream/10 hover:bg-cream/20 text-cream flex items-center justify-center backdrop-blur transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <motion.img
              key={index}
              src={images[index]}
              alt={`${alt} — ${index + 1}`}
              className="max-h-[88vh] max-w-[92vw] object-contain rounded-sm"
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            />

            <button
              type="button"
              onClick={next}
              className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-cream/10 hover:bg-cream/20 text-cream flex items-center justify-center backdrop-blur transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 eyebrow text-cream/70">
              {index + 1} / {images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
