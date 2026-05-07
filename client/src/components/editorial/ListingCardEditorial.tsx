import { Link } from "react-router-dom";
import { useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { Listing } from "@/types/listing";

interface ListingCardEditorialProps {
  listing: Listing;
  /** Optional eyebrow line (e.g. "BEACHFRONT VILLA · TULUM"). */
  eyebrow?: string;
  className?: string;
}

/**
 * Editorial listing card. Cardless — no border, no bg. Image (rounded-sm) with
 * hover scale + image carousel dots. Below: title, location, price.
 * Heart toggle in top-right of image (localStorage wishlist; persistence layer
 * lands in Day 2 alongside data layer migration).
 */
export function ListingCardEditorial({
  listing,
  eyebrow,
  className,
}: ListingCardEditorialProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const images = listing.images?.length ? listing.images : ["/placeholder.svg"];

  return (
    <article className={`group ${className ?? ""}`}>
      <div className="relative overflow-hidden rounded-sm aspect-[4/5] bg-bone">
        <Link to={`/listings/${listing._id}`} aria-label={listing.title}>
          {images.map((src, i) => (
            <motion.img
              key={src + i}
              src={src}
              alt={`${listing.title} — ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              className="absolute inset-0 w-full h-full object-cover"
              initial={false}
              animate={{ opacity: i === activeImage ? 1 : 0, scale: i === activeImage ? 1 : 1.02 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            />
          ))}
          <motion.div
            className="absolute inset-0"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </Link>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setFavorited((f) => !f);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-cream/85 backdrop-blur-sm hover:bg-cream transition-colors"
          aria-label={favorited ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              favorited ? "fill-terracotta text-terracotta" : "text-ink"
            }`}
          />
        </button>

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`View image ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveImage(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeImage ? "w-5 bg-cream" : "w-1.5 bg-cream/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <Link to={`/listings/${listing._id}`} className="block mt-5">
        {eyebrow && <p className="eyebrow text-ink2 mb-2">{eyebrow}</p>}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-lg md:text-xl text-ink leading-snug">
            {listing.title}
          </h3>
          {typeof listing.rating === "number" && (
            <span className="text-sm text-ink2 whitespace-nowrap">
              ★ {listing.rating.toFixed(2)}
            </span>
          )}
        </div>
        <p className="text-sm text-ink3 mt-1">{listing.location}</p>
        <p className="font-display text-base md:text-lg text-ink mt-3">
          ${listing.price}
          <span className="text-ink3 text-sm font-sans"> / night</span>
        </p>
      </Link>
    </article>
  );
}
