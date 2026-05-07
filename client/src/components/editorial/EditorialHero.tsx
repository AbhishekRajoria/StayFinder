import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

interface EditorialHeroProps {
  image: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  /** Optional ratio override; defaults to a tall hero h-[88vh]. */
  className?: string;
}

/**
 * Full-bleed hero with image + overlay grid. Used on Home (and could be used on
 * Listings landing). Image gets a slow Ken Burns crawl. Overlay copy fades up on
 * mount with editorial easing.
 */
export function EditorialHero({
  image,
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: EditorialHeroProps) {
  const prefersReduced = useReducedMotion();

  return (
    <section
      className={`relative h-[88vh] min-h-[640px] w-full overflow-hidden bg-ink ${
        className ?? ""
      }`}
    >
      {/* Image layer */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt=""
          className={`object-cover w-full h-full ${
            prefersReduced ? "" : "animate-kenburns"
          }`}
          loading="eager"
        />
        {/* Strong bottom darken so the headline reads on any photo. The first
           gradient handles vertical legibility; the second is a soft ellipse
           anchored bottom-left where the headline lives. */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/40 to-ink/90" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 25% 80%, rgba(31,27,22,0.55), transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full container-page flex flex-col justify-end pb-22 md:pb-28">
        <div className="grid grid-cols-12 gap-6 items-end">
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 }}
            className="col-span-12 md:col-span-8"
          >
            {eyebrow && (
              <p
                className="eyebrow text-cream/85 mb-6"
                style={{ textShadow: "0 1px 12px rgba(0,0,0,0.45)" }}
              >
                {eyebrow}
              </p>
            )}
            <h1
              className="font-display text-cream text-display-xl"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.45)" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="mt-6 text-cream/90 text-base md:text-lg max-w-xl italic font-display"
                style={{ textShadow: "0 1px 16px rgba(0,0,0,0.45)" }}
              >
                {subtitle}
              </p>
            )}
          </motion.div>

          {children && (
            <motion.div
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1], delay: 0.35 }}
              className="col-span-12 md:col-span-4 md:flex md:justify-end"
            >
              {children}
            </motion.div>
          )}
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="eyebrow text-cream/70">Explore</span>
          <span className="block w-px h-12 bg-cream/40" />
        </motion.div>
      </div>
    </section>
  );
}
