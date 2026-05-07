import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** Distance in px the element starts translated down from. */
  distance?: number;
  /** Stagger child motion.* siblings by this delay. */
  stagger?: number;
  /** Once-only or repeat each viewport entry. */
  once?: boolean;
}

/**
 * Editorial lift-in. The single motion primitive used everywhere.
 * Slow easing (600ms cubic-bezier(0.25,0.1,0.25,1)). Respects reduced motion.
 */
export function ScrollReveal({
  children,
  delay = 0,
  className,
  distance = 12,
  stagger,
  once = true,
}: ScrollRevealProps) {
  const prefersReduced = useReducedMotion();

  const variants: Variants = prefersReduced
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0, y: distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
            delay,
            ...(stagger ? { staggerChildren: stagger } : {}),
          },
        },
      };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
