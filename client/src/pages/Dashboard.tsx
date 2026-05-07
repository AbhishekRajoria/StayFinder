import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format, isAfter } from "date-fns";
import { Plus, ArrowUpRight } from "lucide-react";

import { getMyListings } from "@/api/listingApi";
import { getMyBookings } from "@/api/bookingApi";
import { Button } from "@/components/ui/button";
import {
  ScrollReveal,
  StatBlock,
  ListingCardSkeleton,
} from "@/components/editorial";
import { useAuth } from "@/hooks/useAuth";
import type { Listing } from "@/types/listing";
import type { Booking } from "@/types/booking";
import type { ApiResponse } from "@/types/api";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: listingsData, isLoading: isLoadingListings } = useQuery<
    ApiResponse<{ listings: Listing[] }>
  >({
    queryKey: ["my-listings"],
    queryFn: getMyListings,
  });

  const { data: bookingsData, isLoading: isLoadingBookings } = useQuery<
    ApiResponse<{ bookings: Booking[] }>
  >({
    queryKey: ["my-bookings"],
    queryFn: getMyBookings,
  });

  const listings = listingsData?.data?.listings ?? [];
  const bookings = bookingsData?.data?.bookings ?? [];

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) => b.status !== "cancelled" && isAfter(new Date(b.endDate), now),
  );
  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + (b.totalPrice ?? 0), 0);

  const isHost = user?.role === "host";
  const stats = isHost
    ? [
        { value: String(listings.length), label: "Listings" },
        { value: String(upcomingBookings.length), label: "Upcoming bookings" },
        { value: `$${totalRevenue.toLocaleString()}`, label: "Lifetime revenue" },
      ]
    : [
        { value: String(bookings.filter((b) => b.status === "confirmed").length), label: "Stays booked" },
        { value: String(upcomingBookings.length), label: "Upcoming" },
        { value: String(bookings.length), label: "Total reservations" },
      ];

  return (
    <div className="bg-cream min-h-screen">
      <section className="container-page pt-12 md:pt-20 pb-10">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="eyebrow text-ink2 mb-4">Your atelier</p>
            <h1 className="font-display text-display text-ink leading-tight">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
            </h1>
          </div>
          {isHost && (
            <Button asChild>
              <Link to="/listings/create" className="gap-2">
                <Plus className="h-4 w-4" />
                New listing
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Stats strip */}
      <section className="container-page border-y border-linen">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-linen">
          {stats.map((s) => (
            <div key={s.label} className="py-10 px-2 first:pl-0 last:pr-0">
              <StatBlock value={s.value} label={s.label} />
            </div>
          ))}
        </div>
      </section>

      {/* Two columns — listings + bookings */}
      <section className="container-page py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
          {isHost && (
            <ScrollReveal>
              <SectionHeader
                eyebrow="Hosting"
                title="Your listings"
                href="/my-listings"
                hrefLabel="Manage all"
              />
              {isLoadingListings ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ListingCardSkeleton />
                  <ListingCardSkeleton />
                </div>
              ) : listings.length === 0 ? (
                <EmptyBlock
                  copy="No listings yet. Open your first home to thoughtful travellers."
                  href="/listings/create"
                  cta="List your home"
                />
              ) : (
                <ul className="divide-y divide-linen border-y border-linen">
                  {listings.slice(0, 4).map((l) => (
                    <RowLink
                      key={l._id}
                      to={`/listings/${l._id}`}
                      title={l.title}
                      meta={`${l.location} · $${l.price}/night`}
                      image={l.images?.[0]}
                    />
                  ))}
                </ul>
              )}
            </ScrollReveal>
          )}

          <ScrollReveal delay={0.1}>
            <SectionHeader
              eyebrow="Travel"
              title="Your bookings"
              href="/bookings"
              hrefLabel="View all"
            />
            {isLoadingBookings ? (
              <ul className="divide-y divide-linen border-y border-linen">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="py-5 animate-soft-pulse h-20 bg-bone/40" />
                ))}
              </ul>
            ) : bookings.length === 0 ? (
              <EmptyBlock
                copy="When you book a stay, it'll appear here."
                href="/listings"
                cta="Browse stays"
              />
            ) : (
              <ul className="divide-y divide-linen border-y border-linen">
                {bookings.slice(0, 4).map((b) => (
                  <RowLink
                    key={b._id}
                    to={`/listings/${b.listing?._id}`}
                    title={b.listing?.title ?? "Untitled stay"}
                    meta={`${format(new Date(b.startDate), "MMM d")} → ${format(new Date(b.endDate), "MMM d")} · ${b.status}`}
                    image={b.listing?.images?.[0]}
                  />
                ))}
              </ul>
            )}
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  href,
  hrefLabel,
}: {
  eyebrow: string;
  title: string;
  href: string;
  hrefLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <p className="eyebrow text-ink2 mb-2">{eyebrow}</p>
        <h2 className="font-display text-2xl text-ink">{title}</h2>
      </div>
      <Link to={href} className="editorial-link text-xs">
        {hrefLabel}
      </Link>
    </div>
  );
}

function RowLink({
  to,
  title,
  meta,
  image,
}: {
  to: string;
  title: string;
  meta: string;
  image?: string;
}) {
  return (
    <li>
      <Link
        to={to}
        className="group flex items-center gap-5 py-5 hover:opacity-90 transition-opacity"
      >
        <div className="h-14 w-14 rounded-sm overflow-hidden bg-bone shrink-0">
          {image ? (
            <img src={image} alt="" className="w-full h-full object-cover" />
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-base text-ink truncate">{title}</p>
          <p className="text-xs text-ink3 truncate mt-1">{meta}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-ink3 group-hover:text-ink transition-colors" />
      </Link>
    </li>
  );
}

function EmptyBlock({
  copy,
  href,
  cta,
}: {
  copy: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="bg-bone rounded-sm p-8">
      <p className="text-ink2 max-w-md leading-relaxed">{copy}</p>
      <Button asChild variant="editorial" className="mt-6">
        <Link to={href}>{cta} →</Link>
      </Button>
    </div>
  );
}
