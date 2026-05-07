import { motion, useReducedMotion } from "framer-motion";

interface MarqueeTickerProps {
  items: string[];
  /** seconds for one full loop */
  duration?: number;
  className?: string;
}

/**
 * Slow horizontal infinite marquee in display serif. Pause on hover via group state.
 * Pixel-precise looping by duplicating the list and translating from 0 to -50%.
 */
export function MarqueeTicker({ items, duration = 50, className }: MarqueeTickerProps) {
  const prefersReduced = useReducedMotion();
  const doubled = [...items, ...items];

  return (
    <div className={`overflow-hidden border-y border-linen py-10 md:py-14 group ${className ?? ""}`}>
      <motion.div
        className="flex gap-12 md:gap-16 whitespace-nowrap will-change-transform"
        animate={prefersReduced ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-display text-display-lg text-ink/30 group-hover:text-ink/80 transition-colors duration-700 select-none flex items-center gap-12"
          >
            {item}
            <span className="text-terracotta text-2xl">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
