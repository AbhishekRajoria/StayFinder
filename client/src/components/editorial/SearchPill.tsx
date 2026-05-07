import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Search } from "lucide-react";

interface SearchPillProps {
  /** When `dark`, render against bright/photo background (used on hero). */
  variant?: "dark" | "light";
}

/**
 * Shapeshifting search pill. Collapsed = single rounded pill with placeholder.
 * Expanded = 4 segments (Where / When / Guests / Search btn). Toggled by click.
 * Submits to /listings with current search params.
 */
export function SearchPill({ variant = "dark" }: SearchPillProps) {
  const [expanded, setExpanded] = useState(false);
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");
  const [guests, setGuests] = useState("");

  const onPill = variant === "dark" ? "bg-cream text-ink" : "bg-cream text-ink border border-linen";
  const segmentBorder = "border-r border-linen";

  return (
    <LayoutGroup>
      {!expanded ? (
        <motion.button
          layout
          onClick={() => setExpanded(true)}
          className={`flex items-center gap-3 ${onPill} rounded-full pl-6 pr-2 py-2 shadow-editorial w-full md:w-[420px] text-left transition-shadow hover:shadow-[0_30px_70px_-25px_rgba(31,27,22,0.28)]`}
          initial={false}
          aria-expanded={false}
        >
          <span className="flex-1 text-sm text-ink2">Where to · Anywhere</span>
          <span className="bg-terracotta text-cream rounded-full p-2.5">
            <Search className="h-4 w-4" />
          </span>
        </motion.button>
      ) : (
        <motion.div
          layout
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-cream rounded-full shadow-editorial w-full md:w-[680px] flex items-stretch"
        >
          <div className={`flex-1 px-6 py-3 ${segmentBorder}`}>
            <p className="eyebrow mb-1">Where</p>
            <input
              autoFocus
              type="text"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="Search destinations"
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink3 focus:outline-none"
            />
          </div>
          <div className={`flex-1 px-6 py-3 ${segmentBorder}`}>
            <p className="eyebrow mb-1">When</p>
            <input
              type="text"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              placeholder="Add dates"
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink3 focus:outline-none"
            />
          </div>
          <div className="flex-1 px-6 py-3">
            <p className="eyebrow mb-1">Guests</p>
            <input
              type="text"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="Add guests"
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink3 focus:outline-none"
            />
          </div>
          <Link
            to={{
              pathname: "/listings",
              search: new URLSearchParams({
                ...(where && { search: where }),
                ...(where && { location: where }),
                ...(guests && { minGuests: guests }),
              }).toString(),
            }}
            className="flex items-center gap-2 bg-terracotta text-cream rounded-full px-6 my-2 mr-2 hover:bg-terracotta2 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="eyebrow text-cream">Search</span>
          </Link>
        </motion.div>
      )}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
            className="fixed inset-0 z-[-1] cursor-default"
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
