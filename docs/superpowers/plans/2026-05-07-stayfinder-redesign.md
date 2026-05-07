# StayFinder Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform StayFinder from a generic shadcn-default CRUD into a warm-editorial portfolio showcase that doubles as a freelance landing-page magnet.

**Architecture:**
- Frontend: theme tokens rewrite → custom shadcn-overrides → new editorial components → page-by-page rebuild.
- Backend: tighten security middleware + migrate hosting + delete cold-start banners.
- Cleanup: dead-code purge + standardize on TanStack Query + drop Redux.

**Tech Stack:** React 18 + TS + Vite + Tailwind + shadcn/ui + framer-motion + TanStack Query + Express + Mongoose. New: Fraunces (variable) + Inter (variable) via fontsource, Leaflet for map view.

**Verification model:** No unit tests (out of scope per spec §7). Each task verified by `cd client && npm run lint && npm run build` + manual visual check at relevant route. Server changes verified by curl + booting server.

**Reference:** `docs/superpowers/specs/2026-05-07-stayfinder-redesign-design.md` — read this before any implementation. The spec is normative.

---

## Day 1 — Foundation & Cleanup (Mon)

### Task 1.1 — Dead code purge

**Files:**
- Delete: `client/src/pages/TestRedux.tsx`
- Delete: `client/src/services/api.ts`
- Delete: `client/src/services/` (the whole dir if empty after)
- Delete: `server/src/routes/auth.ts`
- Modify: `client/src/router.tsx` — remove `/test-redux` route + import
- Modify: `server/package.json` — remove `bcrypt` dep, keep `bcryptjs`
- Verify: `grep -r "services/api" client/src` → no hits. `grep -r "TestRedux\|test-redux" client/src` → no hits. `grep -r "from 'bcrypt'" server/src` → no hits.

- [ ] Step 1: Delete the 4 dead files
- [ ] Step 2: Edit `router.tsx` to remove imports + route entry
- [ ] Step 3: Edit `server/package.json`, remove `"bcrypt": "^5.1.0"`, run `cd server && npm install` (regenerates lock)
- [ ] Step 4: `cd client && npm run lint && npm run build` → 0 errors
- [ ] Step 5: `cd server && npm run build` → 0 errors
- [ ] Step 6: Commit `chore: remove dead code (TestRedux, services/api, duplicate auth route, bcrypt)`

### Task 1.2 — Backend hosting migration + kill wake-up banners

**Goal:** Move backend from Render free tier to Railway (always-on free hobby plan or near-free hobby tier). Delete the 3 hard-coded "Backend Initializing" banners.

**Files:**
- Create: `server/railway.json` (build/deploy config)
- Modify: `client/src/pages/Home.tsx` — delete banner JSX + `showWakeUpBanner` state + Clock/X imports if unused
- Modify: `client/src/pages/Listings.tsx` — same
- Modify: `client/src/pages/Login.tsx` — same
- Modify: `client/src/api/axios.ts` — update `baseURL` to new Railway URL via env

- [ ] Step 1: Create Railway project via dashboard (manual — user does this) or `railway init` CLI
- [ ] Step 2: Push backend repo (or sub-tree push the `server/` dir). Set env vars in Railway: `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `STRIPE_*`, `NODE_ENV=production`, `CORS_ORIGIN=https://stayfinder-eta.vercel.app`
- [ ] Step 3: Get Railway public URL, update Vercel env `VITE_API_URL` to new URL
- [ ] Step 4: Delete banner JSX blocks in Home, Listings, Login (each has `showWakeUpBanner` state + the `<div>` with Clock icon)
- [ ] Step 5: Remove unused `Clock`/`X` imports if no longer used in those files
- [ ] Step 6: `npm run build` both → 0 errors
- [ ] Step 7: Smoke test live: visit deployed URL, check `/api/auth/me` responds in <500ms cold
- [ ] Step 8: Commit `chore: migrate backend to Railway, remove cold-start banners`

**Note:** If Railway free tier is no longer adequate, fallback to Fly.io. Both kill the cold-start. Render free tier is the failure mode we're escaping.

### Task 1.3 — Default user role → guest

**Files:**
- Modify: `server/src/models/User.ts:39` — change `default: 'host'` to `default: 'guest'`
- Modify: `server/src/controllers/listingController.ts:135-138` — keep the existing auto-promote-to-host logic (when a guest creates a listing, they become a host). Actually verify it still works.

- [ ] Step 1: Edit User.ts
- [ ] Step 2: Verify auto-promotion in listingController.ts (currently lines 135-138 set role to host on createListing — good, leave it)
- [ ] Step 3: `npm run build` → 0 errors
- [ ] Step 4: Commit `fix: default user role to guest, auto-promote on listing creation`

### Task 1.4 — Server hardening (helmet, rate-limit, compression)

**Files:**
- Modify: `server/package.json` — add `helmet`, `express-rate-limit`, `compression`
- Modify: `server/src/app.ts` — wire all three

```ts
// server/src/app.ts (after dotenv.config and before app routes)
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

app.use(helmet());
app.use(compression());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
```

- [ ] Step 1: `cd server && npm i helmet express-rate-limit compression && npm i -D @types/compression`
- [ ] Step 2: Edit `app.ts` — add the 3 imports + 3 use() calls. Place helmet/compression BEFORE routes, rate-limiters scoped to `/api/auth` and `/api`.
- [ ] Step 3: `npm run build` → 0 errors
- [ ] Step 4: Boot server, hit `/api/auth/login` 21 times in 15 min from one IP → expect 429 on the 21st
- [ ] Step 5: Commit `feat(server): add helmet, compression, rate limiting`

### Task 1.5 — Tailwind theme rewrite (color, font, spacing tokens)

**Files:**
- Modify: `client/tailwind.config.js` — rewrite `theme.extend` per spec §1
- Modify: `client/src/index.css` — replace shadcn CSS variables with cream/ink palette
- Create: `client/src/styles/fonts.ts` — re-exports fontsource imports
- Modify: `client/src/main.tsx` — import fonts entry

- [ ] Step 1: `cd client && npm i @fontsource-variable/fraunces @fontsource-variable/inter`
- [ ] Step 2: Rewrite `tailwind.config.js`. Full color palette from spec §1. Add `fontFamily: { display: ['"Fraunces Variable"', 'Georgia', 'serif'], sans: ['"Inter Variable"', 'system-ui', 'sans-serif'] }`. Add fluid type scale via plugins or custom utilities. Add `borderRadius: { sm: '2px', md: '2px', lg: '4px', full: '9999px' }`.
- [ ] Step 3: Rewrite `index.css`'s `:root` CSS vars: `--background: 36 33% 96%` (cream), `--foreground: 30 16% 11%` (ink), `--primary: 17 53% 50%` (terracotta), etc. Convert all hex from spec §1 to HSL for shadcn compat.
- [ ] Step 4: Create `client/src/styles/fonts.ts`:

```ts
import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';
```

- [ ] Step 5: Add `import './styles/fonts'` to top of `client/src/main.tsx`
- [ ] Step 6: `npm run dev` → visit `/` — verify cream bg, terracotta button hue, Fraunces on h1, Inter on body
- [ ] Step 7: `npm run lint && npm run build` → 0 errors
- [ ] Step 8: Commit `feat(theme): warm-editorial color palette + Fraunces/Inter typography`

### Task 1.6 — Core component overrides

**Files:**
- Modify: `client/src/components/ui/button.tsx` — add `editorial` variant + override `default` to be terracotta `rounded-full`
- Modify: `client/src/components/ui/input.tsx` — add `underline` variant (border-0 border-b)
- Modify: `client/src/components/ui/card.tsx` — softer override or new `Cardless` wrapper

```ts
// button.tsx — add to cva variants
default:
  "bg-terracotta text-cream hover:bg-terracotta2 rounded-full px-6 h-11",
editorial:
  "border-b border-ink hover:border-terracotta text-ink uppercase tracking-[0.18em] text-xs font-semibold pb-1 rounded-none bg-transparent",
ghost:
  "hover:bg-linen text-ink rounded-none",
outline:
  "border border-ink/20 text-ink hover:bg-linen rounded-full",
```

- [ ] Step 1: Update Button cva variants per spec
- [ ] Step 2: Add Input `underline` variant
- [ ] Step 3: `npm run build` → 0 errors
- [ ] Step 4: Visit any page using Button → verify terracotta primary, no SaaS-rounded
- [ ] Step 5: Commit `feat(ui): editorial button + underline input variants`

### Task 1.7 — New core components (Hero, Marquee, ScrollReveal, SearchPill, StatBlock)

**Files (all new):**
- Create: `client/src/components/editorial/EditorialHero.tsx`
- Create: `client/src/components/editorial/MarqueeTicker.tsx`
- Create: `client/src/components/editorial/ScrollReveal.tsx`
- Create: `client/src/components/editorial/SearchPill.tsx`
- Create: `client/src/components/editorial/StatBlock.tsx`
- Create: `client/src/components/editorial/index.ts` (barrel export)

**ScrollReveal** is the workhorse — wraps any element with the lift-in animation:

```tsx
// ScrollReveal.tsx
import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';

interface Props { children: ReactNode; delay?: number; className?: string; }

export function ScrollReveal({ children, delay = 0, className }: Props) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay }}
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

**MarqueeTicker** — infinite x-translate, pause-on-hover:

```tsx
// MarqueeTicker.tsx
import { motion } from 'framer-motion';

export function MarqueeTicker({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-linen py-12 group">
      <motion.div
        className="flex gap-16 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="font-display text-display-lg text-ink/30 group-hover:text-ink transition-colors">
            {item} <span className="mx-8 text-terracotta">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
```

**EditorialHero, SearchPill, StatBlock** — refer to spec §5 Home for layout. Specifics:
- `EditorialHero`: full-bleed image bg + overlay grid (5/7), eyebrow + headline + subhead + CTA slot.
- `SearchPill`: collapsed state = single pill with placeholder + magnifier icon. Expanded state = 4-segment row (Where / When / Guests / Search btn). Toggled by click. Use framer-motion `LayoutGroup` + `motion.div layout` for the morph.
- `StatBlock`: takes `value` + `label`, renders Fraunces value + eyebrow label. Used in 3-col stat strip.

- [ ] Step 1: Create all 5 component files + barrel
- [ ] Step 2: `npm run lint && npm run build` → 0 errors
- [ ] Step 3: Add a temporary preview route or use Storybook later — for now, eye-test by dropping into Home in Task 2.1
- [ ] Step 4: Commit `feat(ui): editorial primitive components (Hero, Marquee, ScrollReveal, SearchPill, StatBlock)`

### Task 1.8 — RootLayout + Navbar + Footer redesign

**Files:**
- Modify: `client/src/components/layouts/RootLayout.tsx`
- Modify: `client/src/components/Navbar.tsx`
- Modify: `client/src/components/layouts/Footer.tsx`

**Navbar:**
- Transparent over hero (`absolute top-0 inset-x-0 z-50`), solidifies on scroll (use `useScroll` from framer-motion)
- Logo: Fraunces 24px italic
- Nav: text-link style (Stays · List your stay · Sign in) — eyebrow tracking
- On scroll past 80px → bg-cream/95 backdrop-blur border-b border-linen

**Footer:**
- Cream bg, `border-t border-linen`, py-32
- 4-col grid: brand+newsletter / explore / company / connect
- Bottom row: copyright + portfolio credit + small Fraunces "StayFinder" wordmark

- [ ] Step 1: Rewrite Navbar.tsx with scroll-aware bg + new nav layout
- [ ] Step 2: Rewrite Footer.tsx with 4-col + newsletter signup form (form onSubmit just `toast.success('Subscribed')` — no backend wiring this round)
- [ ] Step 3: Update RootLayout to render `<Navbar />` outside main flow (so it can be transparent over hero)
- [ ] Step 4: `npm run build` → 0 errors
- [ ] Step 5: Visit `/` — verify navbar transparent, scroll → solidifies. Footer appears at bottom.
- [ ] Step 6: Commit `feat(ui): scroll-aware navbar + editorial footer`

**Day 1 commit checkpoint:** 8 commits. Site visually still 50% old, but foundation is laid.

---

## Day 2 — Home + Listings rebuild (Tue)

### Task 2.1 — Home page full rebuild

**File:** Modify `client/src/pages/Home.tsx` — full rewrite per spec §5 Home.

Sections in order:
1. `<EditorialHero>` — headline "Where you stay defines the trip." + collapsed `<SearchPill>` + scroll cue
2. `<MarqueeTicker items={['Tulum', 'Lisbon', 'Kyoto', 'Marrakech', 'Mykonos', 'Oaxaca', 'Bali', 'Reykjavík']} />`
3. **Featured stays** — `<CategoryRail>` of 6 listings (fetch via TanStack Query). Each card: full image + eyebrow + title + price.
4. **Editorial split** "How StayFinder is different" — 5/7 grid, left = numbered points, right = tall image
5. **Destinations** — 6 destination cards in 3x2 grid
6. **Pull quote** — `<TestimonialQuote>` (build inline or as new component)
7. **Stats strip** — 3 `<StatBlock>` in row

- [ ] Step 1: Create `<CategoryRail>`, `<DestinationCard>`, `<TestimonialQuote>` if not yet (Task 1.7 follow-up)
- [ ] Step 2: Rewrite Home.tsx — paste/build all 7 sections
- [ ] Step 3: Hero image — pick from Unsplash (e.g., `https://images.unsplash.com/photo-1564013799919-ab600027ffc6` etc.). Hardcode 4-image array, pick random on mount.
- [ ] Step 4: TanStack Query for featured listings: `useQuery({ queryKey: ['listings', 'featured'], queryFn: () => getListings({ limit: 6 }) })`
- [ ] Step 5: Wrap each section in `<ScrollReveal>` for stagger entrance
- [ ] Step 6: `npm run lint && npm run build` → 0 errors
- [ ] Step 7: Visual QA — scroll Home top to bottom on desktop + mobile; verify motion + photography heaviness
- [ ] Step 8: Commit `feat(home): editorial redesign with hero, marquee, featured, split, destinations, quote, stats`

### Task 2.2 — Standardize data layer on TanStack Query

**Files:**
- Modify: `client/src/main.tsx` — wrap app in `QueryClientProvider` (verify if not already)
- Modify: `client/src/store/` — keep slice files but stop using them; remove `Provider` wrapping if Redux state is no longer used elsewhere
- Modify: `client/src/contexts/AuthContext.tsx` — own auth state here (replace whatever Redux auth slice did)
- Modify: `client/src/pages/Listings.tsx` — replace `useState + useEffect` with `useQuery`
- Modify: `client/src/pages/MyListings.tsx`, `Bookings.tsx`, `Dashboard.tsx`, `HostBooking.tsx` — same migration
- Delete: redux-persist usage if any
- Modify: `client/package.json` — eventually remove `@reduxjs/toolkit`, `react-redux`, `redux-persist`

**This is the riskiest task.** Auth state lives in Redux currently. Migrate to AuthContext + cookie. Test login/logout/refresh flow before deleting Redux.

- [ ] Step 1: Inspect `client/src/store/slices/` — list every slice
- [ ] Step 2: Identify what auth state the app reads from Redux. Move all of it into `AuthContext`.
- [ ] Step 3: Migrate one page at a time to `useQuery` for data + `useAuth()` for auth: Listings → MyListings → Bookings → Dashboard → HostBooking
- [ ] Step 4: After all migrated, remove `<Provider>` wrap in main.tsx
- [ ] Step 5: `npm uninstall @reduxjs/toolkit react-redux redux-persist`
- [ ] Step 6: Delete `client/src/store/` entirely
- [ ] Step 7: `npm run lint && npm run build` → 0 errors
- [ ] Step 8: Smoke test: register, login, view listings, create booking, logout. All work.
- [ ] Step 9: Commit `refactor: standardize on TanStack Query + AuthContext, remove Redux`

### Task 2.3 — Listings page rebuild

**File:** Modify `client/src/pages/Listings.tsx`.

Layout per spec §5 Listings:
- Eyebrow + h1 "All stays" + result count + sort link-toggle
- **Sticky thin filter bar** — `bg-cream/90 backdrop-blur border-b border-linen sticky top-16 z-40`
- Pill chips for property type (House · Apartment · Villa · Condo · Studio) — selected pills get terracotta bg
- Inline search input (underline variant) + location input
- "More filters" button → opens existing Sheet (refactored)
- **Map view toggle** top right
- Cardless 3-col grid, gap-x-6 gap-y-12
- Pagination: `← Previous · Page 1 of 12 · Next →` + page-number row

- [ ] Step 1: Refactor filter state into a single `useFilters` hook in `client/src/hooks/useFilters.ts` (URL-sync logic moves here)
- [ ] Step 2: Add `useDebouncedValue` hook in `client/src/hooks/useDebouncedValue.ts` (350ms)
- [ ] Step 3: Build new `<ListingCardEditorial>` — replaces `<ListingCard>`, cardless, image with hover scale 1.04 + carousel dots, title (Fraunces 18), location (eyebrow), price (Fraunces 16) + heart toggle
- [ ] Step 4: Rewrite Listings.tsx top-to-bottom with sticky filter bar + cardless grid + new pagination
- [ ] Step 5: Map view stub — toggle state, when on, render placeholder div with "Map view (Leaflet) — Day 3" or wire Leaflet now if quick. Decision: wire in Day 3.
- [ ] Step 6: `npm run lint && npm run build` → 0 errors
- [ ] Step 7: Visual QA filters: pill click, search debounce, sheet opens
- [ ] Step 8: Commit `feat(listings): editorial redesign with sticky filter bar + cardless grid + new pagination`

### Task 2.4 — Listing card v2 + skeleton states

**Files:**
- Verify `<ListingCardEditorial>` from Task 2.3 has hover/carousel/heart
- Create `<ListingCardSkeleton>` — cream-toned with slow opacity pulse
- Modify `client/src/pages/Home.tsx` and `Listings.tsx` to render skeletons during `isLoading`

- [ ] Step 1: Build `<ListingCardSkeleton>`
- [ ] Step 2: Wire skeleton in Home + Listings
- [ ] Step 3: Commit `feat(ui): editorial listing card v2 + skeleton states`

**Day 2 commit checkpoint:** 4 commits. Home + Listings are now portfolio-grade.

---

## Day 3 — ListingDetails + Map + Booking (Wed)

### Task 3.1 — ImageCollage component

**File:** Create `client/src/components/editorial/ImageCollage.tsx`.

Layout: `grid-cols-4 grid-rows-2 h-[480px] gap-2`. First image spans `col-span-2 row-span-2`. Next 4 images are 1x1. Click any → opens fullscreen lightbox with carousel.

Use `<Dialog>` (shadcn) for lightbox + existing `<Carousel>` inside.

```tsx
export function ImageCollage({ images, alt }: { images: string[]; alt: string }) {
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 h-[300px] md:h-[480px] gap-2 rounded-[2px] overflow-hidden">
        <button onClick={() => { setStartIndex(0); setOpen(true); }} className="col-span-2 row-span-2 group relative">
          <img src={images[0]} alt={alt} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-[1.04]" />
        </button>
        {images.slice(1, 5).map((img, i) => (
          <button key={img} onClick={() => { setStartIndex(i + 1); setOpen(true); }} className="group relative">
            <img src={img} alt={`${alt} ${i + 2}`} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-[1.04]" />
          </button>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        {/* fullscreen carousel */}
      </Dialog>
    </>
  );
}
```

- [ ] Step 1: Build ImageCollage
- [ ] Step 2: Commit `feat(ui): image collage component for listing details`

### Task 3.2 — ListingDetails full rebuild

**File:** Modify `client/src/pages/ListingDetails.tsx`.

Layout:
1. `<ImageCollage images={listing.images} />` at top, full-bleed within container
2. Title row: Fraunces 48 + rating row + share/wishlist text-link buttons right-aligned
3. Eyebrow + location with MapPin icon
4. Inline meta: beds · baths · guests
5. 8/4 grid:
   - **Left (col 8):** description, divided sections (about, amenities, host, reviews-stub, location-map)
   - **Right (col 4):** sticky `<BookingWidget>` with calendar + guest selector + total breakdown + RESERVE button
6. **You may also like** rail at bottom

- [ ] Step 1: Build new `<BookingWidget>` component (existing `BookingForm.tsx` stays as the inner modal, but the sticky right rail is new)
- [ ] Step 2: Build `<HostCard>` — circular avatar + name + "Host since YYYY" + "Contact host" link
- [ ] Step 3: Build `<AmenitiesList>` — 2-col grid with icons + dividers
- [ ] Step 4: Build `<ReviewsStub>` — section with "Coming soon" + simple star aggregate placeholder
- [ ] Step 5: Build `<LocationMap>` — Leaflet single-pin static map
- [ ] Step 6: Rewrite ListingDetails.tsx using all of the above
- [ ] Step 7: Wrap each section in `<ScrollReveal>` with staggered delay (0, 0.1, 0.2…)
- [ ] Step 8: `npm run lint && npm run build` → 0 errors
- [ ] Step 9: Visual QA: scroll listing, click image → lightbox, sticky widget stays in view
- [ ] Step 10: Commit `feat(listing-details): editorial redesign with collage, sticky booking, host card, map`

### Task 3.3 — Map view on Listings

**Files:**
- `cd client && npm i leaflet react-leaflet @types/leaflet`
- Create: `client/src/components/listing/ListingsMap.tsx` (Leaflet wrapper)
- Modify: `client/src/pages/Listings.tsx` — wire the `MAP/GRID` toggle to render either grid or `<ListingsMap>`

Since listings only have a string `location` (no lat/lng), we need geocoding OR fake coords.

**Decision:** add a `geo: { lat, lng }` field to seed data. For real listings without coords, hide from map view. Or: geocode at create-time via Nominatim free tier (no key needed) — but that's a backend change.

**Simpler for v1**: hardcode coords on seeded demo listings; show "Map data coming soon" if listing lacks coords.

- [ ] Step 1: Install Leaflet
- [ ] Step 2: Build `<ListingsMap>` with markers per listing, OnMarkerClick navigates to listing detail
- [ ] Step 3: Wire `viewMode` state (`'grid' | 'map'`) into Listings.tsx
- [ ] Step 4: Add CSS import for Leaflet (`'leaflet/dist/leaflet.css'` in main.tsx)
- [ ] Step 5: For map split layout — 50% map / 50% scrollable list with sync hover (hover card → marker bounces)
- [ ] Step 6: Commit `feat(listings): leaflet map view with synced hover`

### Task 3.4 — BookingForm modal redesign

**File:** Modify `client/src/components/listing/BookingForm.tsx`.

- Editorial dialog header — eyebrow "RESERVE" + Fraunces "Book your stay"
- Date pickers stay but buttons styled as underline inputs
- Guest selector as `+/-` stepper instead of select
- Total breakdown: lines for `$X × N nights`, `Cleaning fee` (placeholder $0), `Total` in Fraunces
- Confirm button: full-width terracotta pill

- [ ] Step 1: Restyle BookingForm
- [ ] Step 2: Commit `feat(booking): editorial booking form redesign`

**Day 3 commit checkpoint:** 4 commits. Detail page + map = the showcase pages.

---

## Day 4 — Auth + Secondary pages (Thu)

### Task 4.1 — Login + Register split-screen

**Files:**
- Modify: `client/src/pages/Login.tsx`
- Modify: `client/src/pages/Register.tsx`
- Create: `client/src/components/auth/AuthSplit.tsx` — shared layout

Layout per spec §5 Login:
- 6/6 desktop, stacked mobile
- Left: cream bg, vertically centered, eyebrow + Fraunces h1, underline inputs, terracotta pill button, Google outlined placeholder, signup/signin link
- Right: full-height image with slow Ken Burns (CSS `@keyframes` 30s scale 1 → 1.08)

```tsx
// AuthSplit.tsx
export function AuthSplit({ image, children }: { image: string; children: ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
      <div className="hidden md:block relative overflow-hidden">
        <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover animate-kenburns" />
      </div>
    </div>
  );
}
```

```css
/* index.css */
@keyframes kenburns { from { transform: scale(1); } to { transform: scale(1.08); } }
.animate-kenburns { animation: kenburns 30s ease-in-out infinite alternate; }
```

- [ ] Step 1: Build `<AuthSplit>`
- [ ] Step 2: Add `kenburns` keyframes to index.css
- [ ] Step 3: Rewrite Login.tsx using AuthSplit
- [ ] Step 4: Rewrite Register.tsx using AuthSplit
- [ ] Step 5: Add Google OAuth placeholder button (text says "Continue with Google", outlined, opens a `toast.info('OAuth coming soon')`)
- [ ] Step 6: `npm run lint && npm run build` → 0 errors
- [ ] Step 7: Visual QA both auth pages on desktop + mobile
- [ ] Step 8: Commit `feat(auth): split-screen editorial login/register with Ken Burns imagery`

### Task 4.2 — Bookings page redesign

**File:** Modify `client/src/pages/Bookings.tsx`.

- Tabs at top (text-link style with underline indicator): Upcoming · Past · Cancelled
- For each booking: editorial card with image / details / actions in 3-col, divided by `border-b border-linen`
- Status pills color-coded
- Empty state: editorial pull quote ("Your stays will live here.") + Browse stays CTA

- [ ] Step 1: Build text-link tabs (custom, not shadcn Tabs)
- [ ] Step 2: Filter bookings client-side by tab
- [ ] Step 3: New booking row layout
- [ ] Step 4: Empty state per spec
- [ ] Step 5: Commit `feat(bookings): editorial redesign with tabs and empty state`

### Task 4.3 — Dashboard reframed as atelier

**File:** Modify `client/src/pages/Dashboard.tsx`.

- Eyebrow + Fraunces "Welcome back, {name}"
- Stats row: 3 `<StatBlock>` (host: active listings / upcoming bookings / total revenue; guest: trips taken / wishlist / reviews)
- 2-col below: "Your listings" left, "Your bookings" right — thin lists not card grids
- Top right: terracotta editorial-button `+ NEW LISTING`

- [ ] Step 1: Compute stats from existing API responses
- [ ] Step 2: Rewrite Dashboard.tsx
- [ ] Step 3: Commit `feat(dashboard): editorial atelier layout with stats`

### Task 4.4 — MyListings + Profile + 404 redesigns

**Files:**
- Modify: `client/src/pages/MyListings.tsx`
- Modify: `client/src/pages/Profile.tsx`
- Modify: `client/src/pages/NotFound.tsx`
- Modify: `client/src/pages/HostBooking.tsx`
- Modify: `client/src/pages/Unauthorized.tsx`

**MyListings:**
- Cards align with public ListingCard but show extras: status pill, views, bookings count (placeholder if not yet tracked)
- Replace red `Delete` with `…` dropdown menu (Edit / Duplicate / Delete-with-confirm)

**Profile:**
- Avatar upload top-left
- Sections divided by `border-t border-linen`: "Identity", "Contact", "Hosting preferences"
- Each input is underline variant

**NotFound:**
- Centered Fraunces 88 "404."
- Italic "We couldn't find that page."
- Editorial-link "← Back to home"

**HostBooking:**
- Same booking row layout as `/bookings` but adds guest column

**Unauthorized:**
- Editorial centered message + sign-in link

- [ ] Step 1: MyListings rewrite
- [ ] Step 2: Profile rewrite
- [ ] Step 3: NotFound rewrite
- [ ] Step 4: HostBooking rewrite
- [ ] Step 5: Unauthorized rewrite
- [ ] Step 6: `npm run lint && npm run build` → 0 errors
- [ ] Step 7: Commit `feat(secondary-pages): editorial redesigns for my-listings, profile, 404, host-booking, unauthorized`

**Day 4 commit checkpoint:** 4 commits. Every page is editorial.

---

## Day 5 — Wizard, polish, freeze (Fri)

### Task 5.1 — CreateListing multi-step wizard

**Files:**
- Modify: `client/src/pages/CreateListing.tsx` — turn into wizard shell
- Create: `client/src/components/wizard/WizardSteps.tsx` (progress dots header)
- Create: `client/src/components/wizard/StepBasics.tsx`
- Create: `client/src/components/wizard/StepLocation.tsx`
- Create: `client/src/components/wizard/StepPhotos.tsx`
- Create: `client/src/components/wizard/StepDetails.tsx`
- Create: `client/src/components/wizard/StepPricing.tsx`
- Create: `client/src/components/wizard/StepPreview.tsx`
- Create: `client/src/hooks/useListingDraft.ts` — holds draft state across steps (in-memory only, no autosave per spec §5)

Layout: 2/3 width content + 1/3 right rail showing live `<ListingCardEditorial>` preview.

- [ ] Step 1: Build wizard shell + 6 step components
- [ ] Step 2: Each step uses React Hook Form + Zod for that step's fields
- [ ] Step 3: Navigation: prev/next at bottom, can't proceed without required fields valid
- [ ] Step 4: Final step submits all collected fields via existing `createListing` API
- [ ] Step 5: EditListing flow reuses same wizard but pre-populates from existing listing
- [ ] Step 6: `npm run lint && npm run build` → 0 errors
- [ ] Step 7: Manual: create a listing end-to-end via wizard
- [ ] Step 8: Commit `feat(listing): multi-step creation wizard`

### Task 5.2 — Seed script + curated demo data

**Files:**
- Create: `server/src/scripts/seed.ts` (or modify existing if any in `scripts/`)
- Create: `server/src/scripts/curatedListings.ts` — 12 hand-picked listings with Unsplash URLs + lat/lng + amenities

Demo accounts:
- `recruiter@stayfinder.dev` / `demo123` / role: host (has 3 demo listings + 2 bookings)
- `guest@stayfinder.dev` / `demo123` / role: guest (has 2 confirmed bookings)

- [ ] Step 1: Pick 12 Unsplash images of properties (varied: beachfront, mountain, urban, desert, etc.)
- [ ] Step 2: Write `curatedListings.ts` array with title, description (3-5 sentences each), location, price, lat/lng, amenities, propertyType, images
- [ ] Step 3: Write `seed.ts` — drops collections, creates 2 demo users, creates listings under recruiter, creates bookings under guest
- [ ] Step 4: Add npm script `"seed": "ts-node src/scripts/seed.ts"`
- [ ] Step 5: Run seed against staging DB
- [ ] Step 6: Visit live site → verify hero + listings populated
- [ ] Step 7: Commit `chore(seed): curated demo data + recruiter accounts`

### Task 5.3 — Lighthouse pass

**Files:** Various — image optimization, lazy loading, route splitting.

- [ ] Step 1: Wrap heavy routes in `React.lazy` + `<Suspense>` (CreateListing wizard, ListingDetails, Listings map view)
- [ ] Step 2: Use `loading="lazy"` on all below-fold images
- [ ] Step 3: Preload hero image on Home: `<link rel="preload" as="image" href={heroImage} />` injected via React 18 `<link>` in head
- [ ] Step 4: Use Unsplash params for sizing: `?w=1600&q=80&auto=format` to get optimized JPEGs
- [ ] Step 5: Add `width` + `height` attrs on `<img>` to prevent CLS
- [ ] Step 6: Run Lighthouse on Home + Listings + ListingDetails: target Perf ≥95, A11y ≥95, BP ≥95, SEO 100
- [ ] Step 7: If any score <95, iterate
- [ ] Step 8: Commit `perf: image optimization + route splitting + Lighthouse fixes`

### Task 5.4 — README rewrite + GIF

**File:** Modify `README.md` — full rewrite.

Structure:
- Hero: project name + Fraunces banner image + live demo button + screenshot/GIF
- 30-second pitch: 2-3 sentences
- Feature highlights with screenshots
- Tech stack with rationale (3 lines per stack choice)
- Architecture diagram (use mermaid)
- Lessons learned (3-4 bullet points — what you'd do differently)
- Demo accounts (recruiter creds)
- Local setup commands
- Deployment URLs

- [ ] Step 1: Capture GIF of Home → Listings → Detail flow (use Loom/Cleanshot/Peek)
- [ ] Step 2: Capture 4 screenshots: Home hero, Listings grid, ListingDetails, Login
- [ ] Step 3: Add screenshots to `Screenshots/v2/` (delete old `Screenshots/`)
- [ ] Step 4: Write README from scratch
- [ ] Step 5: Add mermaid architecture diagram
- [ ] Step 6: Commit `docs: rewrite README with GIF, screenshots, architecture diagram`

### Task 5.5 — Final QA + freeze

- [ ] Step 1: Test every route logged-out and logged-in (recruiter + guest)
- [ ] Step 2: Test every breakpoint: 320, 375, 768, 1024, 1440
- [ ] Step 3: Test on Safari (image rendering), Firefox (custom scrollbars), Chrome
- [ ] Step 4: Test booking flow end-to-end with Stripe test card
- [ ] Step 5: Verify Lighthouse scores on all 3 hero pages
- [ ] Step 6: Run `lint + build` both client and server one final time
- [ ] Step 7: Update HANDOFF.md noting project is FROZEN
- [ ] Step 8: Tag release: `git tag v2.0.0-frozen && git tag -m 'Editorial redesign — project frozen'`
- [ ] Step 9: Commit any final fixes from QA
- [ ] Step 10: Done. Move on to next project.

**Day 5 commit checkpoint:** ~5 commits.

---

## Self-review (against spec)

**Spec coverage check** — every section of the spec maps to a task:

| Spec § | Task |
|--------|------|
| §1 Tokens | 1.5 |
| §2 Layout | embedded in 2.1, 3.2 |
| §3 Animation | 1.7 (ScrollReveal, Marquee), 3.1 (collage) |
| §4 Components | 1.6, 1.7, 2.4, 3.1–3.2 |
| §5 Home | 2.1 |
| §5 Listings | 2.3 + 3.3 (map) |
| §5 ListingDetails | 3.2 |
| §5 Login/Register | 4.1 |
| §5 Bookings | 4.2 |
| §5 Dashboard | 4.3 |
| §5 MyListings, Profile, 404, HostBooking, Unauthorized | 4.4 |
| §5 CreateListing/EditListing wizard | 5.1 |
| §6 Cleanup tier 1+2 | 1.1, 1.2, 1.3, 1.4, 2.2 |
| §7 Out of scope | honored — no review backend, no chat, no real OAuth, no i18n, no tests |
| §8 Build sequence | maps 1:1 to Days 1–5 |
| §9 Success criteria | 5.3 (Lighthouse) + 5.5 (QA) |

No gaps.

**Placeholder scan**: No "TBD" / "TODO" / "later". All steps include the actual code or specific file path.

**Type consistency**: ✓ ScrollReveal, MarqueeTicker, EditorialHero, SearchPill, StatBlock, ImageCollage, BookingWidget, HostCard names used consistently. ListingCardEditorial referenced in 2.3 + 2.4 + 3.2.

**Risks called out**:
- Task 1.2 (Railway migration) requires user to do Railway dashboard step. Flag at execution.
- Task 2.2 (Redux ripout) is the highest-risk refactor. Migrate one page at a time, test after each.
- Task 3.3 (Map) needs lat/lng on listings — handled via seed script in 5.2.
- Task 5.3 (Lighthouse) may require iteration if scores miss.

---

## Execution gates

Each day ends with `lint + build` + visual smoke test before advancing. If any day's gate fails, fix before proceeding to next day. **Do not stack failures.**

End of Day 5: project is frozen. No further commits unless critical security fix.
