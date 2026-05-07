/**
 * Curated Unsplash hero photos. Permissive license, no attribution required.
 * Sized via URL params for LCP — 1800w + q=80 + auto format.
 */
export const HERO_IMAGES = [
  // Tulum cenote, beach villa
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1800&q=80",
  // Marrakech rooftop / Moroccan riad
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1800&q=80",
  // Lisbon balcony / Mediterranean
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1800&q=80",
  // Mountain cabin
  "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?auto=format&fit=crop&w=1800&q=80",
];

export const pickHeroImage = (): string => {
  const i = Math.floor(Math.random() * HERO_IMAGES.length);
  return HERO_IMAGES[i];
};

/** Editorial destination grid — 6 hand-picked. Vary aspect ratio in usage. */
export const DESTINATIONS = [
  {
    name: "Tulum",
    region: "Quintana Roo, Mexico",
    image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80",
    count: 38,
  },
  {
    name: "Lisbon",
    region: "Portugal",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80",
    count: 27,
  },
  {
    name: "Kyoto",
    region: "Japan",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80",
    count: 19,
  },
  {
    name: "Marrakech",
    region: "Morocco",
    image: "https://images.unsplash.com/photo-1539020140153-e479b8c5d6c8?auto=format&fit=crop&w=1200&q=80",
    count: 22,
  },
  {
    name: "Mykonos",
    region: "Cyclades, Greece",
    image: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=1200&q=80",
    count: 31,
  },
  {
    name: "Bali",
    region: "Indonesia",
    image: "https://images.unsplash.com/photo-1518509562904-e7ef99cddc85?auto=format&fit=crop&w=1200&q=80",
    count: 44,
  },
];

/** Marquee ticker copy. */
export const TICKER_LOCATIONS = [
  "Tulum",
  "Lisbon",
  "Kyoto",
  "Marrakech",
  "Mykonos",
  "Oaxaca",
  "Bali",
  "Reykjavík",
  "Cartagena",
  "Florence",
];
