# StayFinder Redesign — Warm Editorial

**Date**: 2026-05-07
**Direction**: Warm editorial (Sonder / Plum Guide / Aman / Habitas school)
**Outcome**: Portfolio + freelance landing-page demo. Project freezes after this work. ~5 working days.

---

## 0. North Star

A property reads like an editorial travel piece, not a CRUD record. Every page should feel like it was designed for a print magazine first, then translated to web. The aesthetic must communicate **taste** — that's the freelance hook (clients in hospitality, beauty, lifestyle, real-estate, F&B will look at this and think "they could do my landing page").

**Reference vocabulary**: Plum Guide, Sonder, Aman, Faena, Onda Beach Club, Habitas, Nobu Hotels, Six Senses, Mr & Mrs Smith. Editorial-magazine sensibility (Cereal, Kinfolk, Magasin) for typography & whitespace.

**Three rules everything must obey**:
1. **Photography is the hero.** Every page leans on big, slow imagery. No emoji, no stock illustrations.
2. **Type does the heavy lifting.** Serif display + sans body. Generous tracking on caps. Real hierarchy, not weight-soup.
3. **Motion is slow & quiet.** Easings are slow-in-fast-out. No bounce, no spring. Time scale 400–700ms, not 200ms. The hum, not the dance.

---

## 1. Design Tokens

### Color palette (Tailwind theme extension)

```ts
// tailwind.config.js — extend
colors: {
  // Warm neutrals
  cream:      '#FAF7F2',  // page bg
  bone:       '#F2EDE5',  // section alt
  linen:      '#E8E0D3',  // dividers, hover
  ink:        '#1F1B16',  // primary text (warm near-black)
  ink2:       '#48413A',  // secondary text
  ink3:       '#8A8074',  // tertiary text / placeholder

  // Accents
  terracotta: '#C0623F',  // primary CTA / link / active
  terracotta2:'#9E4F33',  // hover/pressed
  ochre:      '#D4A24C',  // pricing, badges, ratings (gold-leaning)
  forest:     '#3E5641',  // sparing — used on map markers, "Confirmed"
  rose:       '#E8C8B8',  // tints, notification, hover bg

  // Functional
  success:    '#3E5641',
  danger:     '#A53D2A',
}
```

### Typography
- **Display / Headlines**: `Fraunces` (variable) — slow optical sizing, magazine feel. Used at 32–88px with negative tracking (`-0.02em`).
- **Body / UI**: `Inter` (variable) — neutral workhorse.
- **Caps / Eyebrow**: `Inter` at `letter-spacing: 0.18em`, `text-transform: uppercase`, `text-xs/xs2`.
- Load via `@fontsource-variable/fraunces` and `@fontsource-variable/inter` (no Google Fonts CDN — better LCP, no flash).

**Type scale** (clamp-based, fluid):
- `display-xl`: clamp(48px, 8vw, 88px), Fraunces, weight 400, tracking -0.02em
- `display-lg`: clamp(36px, 5vw, 56px), Fraunces 400, -0.02em
- `display`:    clamp(28px, 4vw, 40px), Fraunces 400, -0.01em
- `h1`: 32px Fraunces 500
- `h2`: 24px Fraunces 500
- `h3`: 18px Inter 600
- `body`: 16px Inter 400, line-height 1.6
- `small`: 14px Inter 400
- `eyebrow`: 11px Inter 600 uppercase, tracking 0.18em

### Spacing & rhythm
- Section vertical rhythm: `py-24 md:py-32 lg:py-40` (generous — magazine-grade whitespace).
- Container max-widths: page-default `max-w-[1280px]`, prose `max-w-prose`, hero `max-w-none` (full bleed).
- 8px grid stays. Add `12` (3rem) and `18` (4.5rem) named utilities for editorial spacing moments.

### Radius
- Cards & images: `rounded-[2px]` (sharp — editorial feel; the round corners shadcn ships are too "SaaS-default")
- Buttons: `rounded-full` for primary CTAs, `rounded-none` for secondary text-link buttons
- Inputs: `rounded-[2px]` thin underline style preferred over filled boxes

### Shadows
- No drop shadows on cards. Use thin `border border-linen` + `hover:border-ink/20` instead.
- Single elevated shadow only for floating overlays/modals: `shadow-[0_24px_60px_-20px_rgba(31,27,22,0.18)]`

### Borders
- `border-linen` for dividers
- `border-ink/8` for subtle separators
- 1px hairlines, never 2px+

---

## 2. Layout System

- **12-column grid on desktop**, 4 on mobile. Use Tailwind's grid utilities + a few asymmetric layouts (8-col content + 4-col aside) for editorial feel.
- **Asymmetric hero** is core to editorial: e.g., headline column 5, image column 7.
- **Stagger image collages**: vary widths, occasionally let an image bleed off the right edge.
- **Sticky bookmarks**: navbar transparent over hero, solidifies on scroll. Booking widget on listing detail sticks.

---

## 3. Animation Language

Use `framer-motion` (already installed). Three motion primitives only — repeat them everywhere for coherence:

1. **Lift-in** — translate-y 12px → 0, opacity 0 → 1, ease-out 600ms, stagger 80ms per child. Used on every section as it scrolls into view.
2. **Image reveal** — clip-path inset(100% 0 0 0) → inset(0 0 0 0), 800ms cubic-bezier(0.65, 0, 0.35, 1). Editorial "curtain pull" — used on hero photos and listing details image collage.
3. **Cursor-aware tilt** — listing cards tilt subtly toward cursor (max ±4°), image inside scales 1.04x on card hover, 700ms ease. NO 3D parallax, just whisper-quiet response.

**Plus three signature moments** (micro-magic the recruiter will GIF):
- **Marquee location ticker** on home — slow horizontal scroll of "Tulum · Lisbon · Kyoto · Marrakech · Mykonos…" in display serif (use `framer-motion` infinite x-translate, pause-on-hover).
- **Search bar shapeshift** — Airbnb-style: collapsed pill on scroll, expands to 4-segment (Where / When / Guests / [Search]) when clicked or at top of page.
- **Progressive image reveal on scroll** — listing detail page, the 5-image collage reveals one-by-one as you scroll past, each clip-pulling in 600ms.

**What NOT to do**: no spring bounces, no parallax flash, no cursor trails, no auto-rotating carousels, no snow-particles, no scroll-jacking. Restrained luxury.

**Reduced motion**: respect `prefers-reduced-motion` — disable all transforms, keep opacity fades.

---

## 4. Component Upgrades (shadcn-overrides)

All shadcn components stay in place but receive theme overrides. New custom components built on top:

| Component | Change |
|-----------|--------|
| **Button** | New `editorial` variant: thin underline, no fill, all-caps tracking. Primary `terracotta` solid, `rounded-full`, no shadow. |
| **Input** | Strip box style. Use bottom-border-only inputs (`border-0 border-b border-linen focus:border-ink rounded-none`). Inputs in modals stay boxed. |
| **Card** | Cardless `ListingCard` v2 — no border, no bg. Image with `rounded-[2px]` + hover scale. Below: title (Fraunces 18), location (eyebrow), price (Fraunces 16). |
| **Badge** | Editorial pill — uppercase tracked, `bg-ink/5 text-ink` or `bg-terracotta/10 text-terracotta`. |
| **Carousel** | Inside cards: dots only at bottom, no arrows. On listing detail: full-width with thumbnail strip. |
| **Skeleton** | Cream-toned, no shimmer animation (too SaaSy). Use a slow opacity pulse instead. |

New components to build:
- `<EditorialHero>` — split-screen 5/7 with eyebrow + display + image
- `<MarqueeTicker>` — infinite location ticker
- `<SearchPill>` — collapsed/expanded search bar
- `<ImageCollage>` — Airbnb-style 1+4 grid for listing detail
- `<ScrollReveal>` — wraps any element with the lift-in motion
- `<StatBlock>` — "1,247 stays · 89 destinations · 4.9 rating" stat line
- `<CategoryRail>` — horizontal scroll rail with editorial category cards (Beachfront, Mountain Retreat, Urban Studios, etc.)
- `<DestinationCard>` — full-bleed image card with overlay text for destinations
- `<TestimonialQuote>` — large pull-quote with citation, magazine-style
- `<HostCard>` — circular avatar + name + tenure + reviews count

---

## 5. Page-by-Page Redesign

### Home `/`
**Above the fold** — full-bleed hero image (Tulum cenote / Marrakech rooftop / Lisbon balcony — randomized from a set of 4 curated images). Overlay:
- Eyebrow: `STAYFINDER · ESTABLISHED 2026`
- Headline (Fraunces 72): `Where you stay defines the trip.`
- Search pill (collapsed → expanding) anchored bottom-center.
- Subhead: small italic line `Hand-picked homes in 89 destinations.`
- Scroll cue: thin vertical line + `↓ EXPLORE`

**Section 1 — Marquee ticker**: location names in Fraunces 88 light, slow infinite horizontal scroll. Black cream bg, thin `border-y border-linen`.

**Section 2 — Featured stays** (replaces current "Featured Listings"): `<CategoryRail>` of horizontal cards. Each card: full image + eyebrow ("BEACHFRONT VILLA · TULUM") + title + price. 6 items, scroll-snap.

**Section 3 — Editorial split** ("How StayFinder is different"): asymmetric grid, left column = 3 numbered points (01 Curated. 02 Verified hosts. 03 Direct booking, no fees.), right column = single tall image.

**Section 4 — Destinations** — 6 destination cards in a 3x2 grid. Hover: image scales 1.05, eyebrow appears.

**Section 5 — Pull quote** — `<TestimonialQuote>` centered, max-w-3xl. Big italic Fraunces.

**Section 6 — Stats strip** — `1,200+ Hand-picked homes · 89 Destinations · 4.9 Average rating` in eyebrow + display row.

**Footer** — redesign: cream bg with `border-t border-linen`. 4-column with newsletter signup left, sitemap mid, social right. Bottom: "© 2026 StayFinder. Built by Abhishek Rajoria." with portfolio link.

### Listings `/listings`
- Drop the heavy navy filter slab. Replace with a **sticky thin filter bar** (`bg-cream/90 backdrop-blur border-b border-linen`).
- Top of page: `<EditorialHero>` mini — eyebrow + h1 ("All stays") + result count + sort dropdown (text-link style, not a select box).
- Filter bar: pill chips for property type (House · Apartment · Villa · Condo · Studio), inline search input with bottom border, "More filters" → opens sheet.
- Grid: 3-col desktop, 2-col tablet, 1-col mobile. **Wider gap** (gap-x-6 gap-y-12). Cards are cardless — image + 3 lines of meta below.
- **Map view toggle** in top-right (`MAP / GRID` text-link toggle). Map view: 50/50 split, Mapbox/Leaflet, pin sync.
- Pagination: rich — `← Previous · Page 1 of 12 · Next →` with page-number row beneath. (Or infinite scroll — pick one in plan).
- Empty state: small editorial illustration (TBD: simple line drawing) + helpful copy + reset button.

### ListingDetails `/listings/:id`
- **Image collage** at top (`<ImageCollage>`): 1 large left + 2x2 small right grid, all clickable to open full-screen lightbox carousel.
- **Title row**: Fraunces 48 title, location below in eyebrow + map pin icon.
- Inline meta: rating (gold star + 4.92 + "143 reviews"), beds/baths/guests as small icons.
- 8-col / 4-col split below: left = description + amenities + host card + reviews, right = sticky `<BookingWidget>` (price, calendar, guests, total breakdown, big terracotta `RESERVE` button).
- **Amenities**: 2-col grid, each row = icon + label, divided by `border-b border-linen`.
- **Host card**: circular avatar + name + "Host since 2024" + "Contact host" link.
- **Reviews section** — placeholder until reviews feature ships (out of scope this round). Show "143 reviews" header with "Coming soon — review system in development" copy or hide until built.
- **Map embed** — single static map below (Mapbox static API or Leaflet).
- **You may also like** — 4-card rail at bottom.

### Login `/login` & Register `/register`
**Split-screen, 6-col / 6-col on desktop, stacked on mobile**:
- Left: cream bg, vertically centered form. Eyebrow `WELCOME BACK` + Fraunces h1 `Sign in to your stays.` Inputs are bottom-border-only. Primary CTA terracotta full-width pill. Below: "Or continue with Google" outlined button. Signup link in eyebrow style.
- Right: full-height image (curated travel photo, slow Ken Burns effect — 30s pan/zoom).
- Mobile: image collapses to top 30% banner, form below.

### Bookings `/bookings`
- Tabs at top: `Upcoming · Past · Cancelled` (text-link tabs, underline on active, no shadcn Tab buttons).
- Each booking card: 3-col grid → image / details / actions. Editorial card (no border, just `border-b border-linen` divider between bookings). Includes:
  - Image (small, square, rounded-[2px])
  - Listing title (Fraunces 18) + location (eyebrow)
  - Date range (Fraunces) + nights count + total
  - Status pill (Confirmed / Pending / Cancelled — color coded)
  - Actions: "View details", "Cancel booking" as text links
- Empty state: editorial pull quote — "Your stays will live here." + CTA "Browse stays".

### Dashboard `/dashboard`
Reframe as a **personal "atelier"**:
- Eyebrow + Fraunces "Welcome back, {name}" header.
- Stats row: 3 stat blocks — "Active listings · Upcoming bookings · Total revenue" (host) or "Past trips · Wishlisted · Reviews" (guest).
- Below: 2-col grid → "Your listings" left, "Your bookings" right. Each is a thin list, not a card grid.
- "Quick actions" row at top right: `+ NEW LISTING` editorial button.

### MyListings `/my-listings`
- Replace the brutal red `Delete` button with a hover-revealed `…` menu (Edit / Duplicate / Delete with confirm).
- Cards align with the public ListingCard but show extra: status pill (Active / Draft), views, bookings count.

### Profile `/profile`
- Avatar upload (large, top-left).
- Form sections in editorial blocks: "Identity", "Contact", "Hosting preferences" — each separated by `border-t border-linen` and section eyebrows.

### CreateListing & EditListing
**Multi-step wizard** (replaces the giant single-form `CreateListing.tsx`). Steps:
1. **Basics** — title, description (with character counters)
2. **Location** — address autocomplete (placeholder for now), country/city, lat/lng (optional)
3. **Photos** — drag-and-drop reorder, 5-image min, lightbox preview
4. **Details** — guests/beds/baths/property type/amenities (visual chip grid, not checkboxes)
5. **Pricing** — nightly rate (with avg-similar-listings hint placeholder), cleaning fee
6. **Preview & publish** — full listing page preview, then publish

Each step: 2/3 width content + 1/3 right rail showing live preview thumbnail. Persistent progress dots at top.

**Out of scope for v1 freeze**: drafts, autosave, address autocomplete (placeholders OK).

### NotFound `/404`
Editorial — Fraunces 88 "404." + small italic "We couldn't find that page." + back-home text link. Centered. No clown.

---

## 6. Cleanup work in scope (Tier 1 + 2)

**Must ship as part of this redesign push**:

1. **Delete dead code**:
   - `client/src/pages/TestRedux.tsx` and the `/test-redux` route
   - `server/src/routes/auth.ts` (duplicate)
   - `client/src/services/api.ts` (dead axios layer)
   - Remove `bcrypt` from `server/package.json` (keep `bcryptjs`)
2. **Standardize data fetching on TanStack Query**: rip out raw axios+useState in Home/Listings; remove Redux Toolkit + redux-persist (move auth state to `AuthContext` + cookie). 4–6 hours.
3. **Backend cold-start fix**: migrate from Render to Railway/Fly.io, add health-check ping (or UptimeRobot pinging `/api/auth/me` every 5min). Delete the 3 hard-coded "Backend Initializing" banners in Home/Listings/Login. 2–3 hours.
4. **Default user role → `'guest'`**: `User.ts:39`. Add a `/profile` action "Become a host". 30 min.
5. **Debounce Listings search**: extract `useDebouncedValue` hook, debounce 350ms. 30 min.
6. **Server hardening**: `helmet`, `express-rate-limit` (auth routes), `compression`, replace dev-mode `morgan` with structured logger. 2 hours.
7. **Skeleton loaders everywhere**: replace all `animate-spin` with proper skeletons matching the redesigned layout. 2 hours.
8. **README rewrite**: hero GIF, architecture diagram, why-this-stack, lessons learned, demo creds. 3 hours.

**Image strategy**: source from Unsplash (free, attribution-clean) for the demo data and hero photography. Pre-pick 30 high-quality property images. Add a `seed.ts` script with curated listings. 2 hours.

---

## 7. Out of scope (the freeze line)

After this redesign, project freezes. Explicitly **NOT building**:
- Reviews/ratings system (mentioned but only placeholder UI)
- Real-time chat
- Wishlist persistence (favorite icon UI only, non-functional)
- AI description generator
- Smart pricing
- i18n / currency switcher
- Email notifications
- OAuth (Google sign-in shown as outlined button placeholder, no backend wiring)
- Tests
- CI

Why: the goal is the **freelance landing-page magnet**, not a complete product. Anyone hiring you for a hospitality landing page will look at Home + ListingDetails + Login and decide. Those three pages must be perfect; the rest must be coherent.

---

## 8. Build sequence — 5 working days

**Day 1 — Foundation & cleanup**
- Delete dead code (TestRedux, auth.ts, services/api.ts, dup bcrypt)
- Install `@fontsource-variable/fraunces`, `@fontsource-variable/inter`, `@react-spring/web` (alt to framer if needed — likely no)
- Tailwind theme: full token rewrite (colors, fonts, spacing, radius)
- Build core shadcn overrides (Button editorial variant, Input underline, Card cardless)
- Build new components: `<EditorialHero>`, `<MarqueeTicker>`, `<ScrollReveal>`, `<SearchPill>`, `<StatBlock>`
- Rewrite `RootLayout` (transparent navbar, footer redesign)
- Backend hosting fix + delete wake-up banners

**Day 2 — Home + Listings**
- Full Home rebuild (all 6 sections + footer)
- Listings rebuild (sticky filter bar, cardless grid, map view stub)
- Standardize data fetching → TanStack Query everywhere
- Remove Redux Toolkit
- Empty/skeleton states

**Day 3 — ListingDetails + booking flow**
- Image collage + lightbox
- Sticky booking widget
- Host card, amenities grid, static map
- Booking modal redesign
- "You may also like" rail

**Day 4 — Auth + secondary pages**
- Login/Register split-screen
- Bookings (tabs, editorial cards)
- Dashboard rebuild
- MyListings (hover menu)
- Profile sections
- 404 page
- Server hardening (helmet, rate-limit, compression)

**Day 5 — CreateListing wizard + polish + freeze**
- Multi-step listing wizard
- Edit listing flow
- Seed script + curated demo data
- Lighthouse pass (image optimization, lazy loading, route splitting)
- README rewrite + GIF capture
- Demo accounts setup (`recruiter@stayfinder.dev` / `demo123`)
- Final QA across breakpoints

---

## 9. Success criteria

This redesign succeeds when:
1. A recruiter scrolling at 1s/page **stops on the Home hero**.
2. A freelance prospect viewing the live demo can imagine their hospitality/lifestyle brand on it within 10 seconds of landing.
3. The visual quality is indistinguishable from a $20k design-studio site — but built solo in a week.
4. No part of the UI says "I used a component library." (shadcn is the chassis, but the visual identity must override it completely.)
5. Lighthouse: **≥95 Performance, ≥95 Accessibility, ≥95 Best Practices, ≥100 SEO** on Home + Listings.

If any of (1)–(4) miss, the redesign hasn't earned the "freelance magnet" job and we revisit. (5) is non-negotiable — Lighthouse below 95 reads as "junior" instantly.

---

## 10. Open questions (defaults chosen, flag if you disagree)

1. **Map provider**: defaulting to **Leaflet + OpenStreetMap** (free, no API key, no token leak risk). Mapbox is prettier but needs a public token + has free-tier limits.
2. **Image source for demo**: defaulting to **Unsplash curated set, committed as URLs** (not downloaded — save bandwidth). Will pre-pick ~30 photos at spec-time so seeds are stable.
3. **OAuth**: defaulting to **placeholder button only**. Wiring real Google OAuth is 1 day of work and I judged it not worth it given the freeze.
4. **Reviews UI**: defaulting to **stub with "Coming soon" copy**. Building real review CRUD adds 1.5 days; would push us past the freeze week.
5. **Wishlist**: defaulting to **client-side localStorage only** (no backend). Heart icon works, persists per-browser, no API surface.
6. **Hosting target**: defaulting to **Railway** (free tier, no cold start, simpler than Fly).

If any default is wrong, flag in spec review.
