import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { getListings } from "@/api/listingApi";
import { pickHeroImage, DESTINATIONS, TICKER_LOCATIONS } from "@/lib/heroImages";
import {
  EditorialHero,
  MarqueeTicker,
  ScrollReveal,
  SearchPill,
  StatBlock,
  TestimonialQuote,
  DestinationCard,
  CategoryRail,
  ListingCardEditorial,
  ListingCardSkeleton,
} from "@/components/editorial";
import { Button } from "@/components/ui/button";

export default function Home() {
  // Pick hero once per mount; useMemo so dev hot-reloads don't reshuffle constantly
  const heroImage = useMemo(() => pickHeroImage(), []);

  const { data, isLoading } = useQuery({
    queryKey: ["listings", "featured"],
    queryFn: () => getListings({ limit: 6, sort: "createdAt", order: "desc" }),
    staleTime: 1000 * 60 * 5,
  });

  const featured = data?.data?.listings ?? [];

  return (
    <div className="bg-cream">
      {/* 1. HERO */}
      <EditorialHero
        image={heroImage}
        eyebrow="StayFinder · Established 2026"
        title={
          <>
            Where you stay
            <br />
            defines the trip.
          </>
        }
        subtitle="Hand-picked homes in eighty-nine destinations."
      >
        <SearchPill variant="dark" />
      </EditorialHero>

      {/* 2. MARQUEE TICKER */}
      <MarqueeTicker items={TICKER_LOCATIONS} duration={55} />

      {/* 3. FEATURED STAYS */}
      <ScrollReveal className="py-22 md:py-28">
        <CategoryRail
          eyebrow="The collection"
          title="Featured stays"
          cta={
            <Link to="/listings" className="hidden md:inline-block editorial-link text-xs">
              View all stays
            </Link>
          }
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="snap-start shrink-0 w-[78vw] sm:w-[44vw] md:w-[32vw] lg:w-[26vw]">
                  <ListingCardSkeleton />
                </div>
              ))
            : featured.length === 0
              ? (
                <p className="text-ink3 text-sm py-12 px-6">No featured stays available right now.</p>
              )
              : featured.map((listing, idx) => (
                  <div
                    key={listing._id}
                    className="snap-start shrink-0 w-[78vw] sm:w-[44vw] md:w-[32vw] lg:w-[26vw]"
                  >
                    <ListingCardEditorial
                      listing={listing}
                      eyebrow={`${listing.propertyType?.toUpperCase() ?? "STAY"} · ${listing.location?.split(",")[0] ?? ""}`}
                    />
                    {/* Stagger imageshow with a CSS-only delay */}
                    <span className="sr-only">{idx}</span>
                  </div>
                ))}
        </CategoryRail>
      </ScrollReveal>

      {/* 4. EDITORIAL SPLIT — How StayFinder is different */}
      <section className="container-page py-22 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <ScrollReveal className="md:col-span-5">
            <p className="eyebrow text-ink2 mb-5">The promise</p>
            <h2 className="font-display text-display text-ink leading-tight">
              How StayFinder is different.
            </h2>
            <p className="text-ink2 mt-7 leading-relaxed max-w-md">
              We don't list everything. We list the homes we'd send our friends to —
              vetted in person, photographed honestly, priced without surprise.
            </p>
            <ol className="mt-12 space-y-10 max-w-md">
              {[
                ["01", "Curated, not crowdsourced.", "Every home is reviewed before it joins the collection."],
                ["02", "Verified hosts.", "We meet (or video-meet) every host. No bait-and-switch."],
                ["03", "Direct booking. No fees.", "What you see is what you pay. Hosts keep more."],
              ].map(([num, h, p]) => (
                <li key={num} className="flex gap-6">
                  <span className="font-display text-2xl text-terracotta leading-none pt-1">{num}</span>
                  <div>
                    <p className="font-display text-xl text-ink leading-snug">{h}</p>
                    <p className="text-ink2 text-sm mt-2 leading-relaxed">{p}</p>
                  </div>
                </li>
              ))}
            </ol>
          </ScrollReveal>

          <ScrollReveal delay={0.15} className="md:col-span-7">
            <div className="aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-sm bg-bone">
              <img
                src="https://images.unsplash.com/photo-1571508601891-ca5e7a713859?auto=format&fit=crop&w=1400&q=80"
                alt="A villa interior at golden hour"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. DESTINATIONS */}
      <ScrollReveal className="py-22 md:py-32 bg-bone/60">
        <div className="container-page">
          <div className="flex items-end justify-between gap-6 mb-12 md:mb-16">
            <div>
              <p className="eyebrow text-ink2 mb-3">Where to go</p>
              <h2 className="font-display text-display text-ink">Destinations.</h2>
            </div>
            <Link to="/listings" className="hidden md:inline-block editorial-link text-xs">
              All destinations
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {DESTINATIONS.map((dest, i) => (
              <DestinationCard
                key={dest.name}
                {...dest}
                href={`/listings?location=${encodeURIComponent(dest.name)}`}
                ratio={i % 3 === 0 ? "tall" : i % 3 === 1 ? "wide" : "tall"}
              />
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* 6. PULL QUOTE */}
      <ScrollReveal className="container-page py-22 md:py-32">
        <TestimonialQuote
          quote={
            <>
              The best trip I've taken started not with the flight, but with a home that
              felt like it had been waiting for me.
            </>
          }
          author="Imogen R."
          meta="Photographer · Returning guest, 4 stays"
        />
      </ScrollReveal>

      {/* 7. STATS STRIP */}
      <section className="border-t border-linen">
        <ScrollReveal className="container-page py-22 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <StatBlock value="1,247" label="Hand-picked homes" />
            <StatBlock value="89" label="Destinations" />
            <StatBlock value="4.92" label="Average guest rating" />
          </div>
        </ScrollReveal>
      </section>

      {/* CTA strip */}
      <section className="container-page pb-22 md:pb-28">
        <div className="rounded-sm bg-ink text-cream py-16 md:py-22 px-8 md:px-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <p className="eyebrow text-cream/70 mb-5">For hosts</p>
            <h3 className="font-display text-display-lg text-cream leading-tight">
              Open your home to thoughtful travellers.
            </h3>
            <p className="text-cream/80 mt-5 max-w-lg">
              Hosting on StayFinder is invitation-led. Apply once, and we handle the rest —
              from photography to pricing.
            </p>
          </div>
          <div className="md:col-span-5 md:flex md:justify-end">
            <Button asChild size="lg" className="bg-cream text-ink hover:bg-cream/90 group">
              <Link to="/listings/create" className="gap-3">
                List your home <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
