import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Wifi,
  Waves,
  Utensils,
  Car,
  Snowflake,
  WashingMachine,
  Tv,
  Dumbbell,
  Star,
  Share2,
  Heart,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { getListing } from "@/api/listingApi";
import { ImageCollage, ScrollReveal } from "@/components/editorial";
import { BookingForm } from "@/components/listing/BookingForm";
import { Listing } from "@/types/listing";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ListingResponse {
  success: boolean;
  data: { listing: Listing };
}

const AMENITY_META: Record<string, { icon: JSX.Element; label: string }> = {
  wifi:    { icon: <Wifi className="h-5 w-5" />,           label: "Wi-Fi" },
  pool:    { icon: <Waves className="h-5 w-5" />,          label: "Pool" },
  kitchen: { icon: <Utensils className="h-5 w-5" />,       label: "Kitchen" },
  parking: { icon: <Car className="h-5 w-5" />,            label: "Parking" },
  ac:      { icon: <Snowflake className="h-5 w-5" />,      label: "Air conditioning" },
  washer:  { icon: <WashingMachine className="h-5 w-5" />, label: "Washer" },
  dryer:   { icon: <WashingMachine className="h-5 w-5" />, label: "Dryer" },
  tv:      { icon: <Tv className="h-5 w-5" />,             label: "Television" },
  gym:     { icon: <Dumbbell className="h-5 w-5" />,       label: "Gym" },
};

export const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(false);

  const { data, isLoading } = useQuery<ListingResponse>({
    queryKey: ["listing", id],
    queryFn: () => getListing(id!),
    enabled: !!id,
  });

  const listing = data?.data.listing;
  const isHost = user?._id === listing?.host?._id;

  const memberSince = useMemo(() => {
    if (!listing) return "";
    // Treat host record without createdAt as joining "this year"
    return new Date().getFullYear().toString();
  }, [listing]);

  if (isLoading) return <ListingDetailsSkeleton />;
  if (!listing) {
    return (
      <div className="container-page py-32 text-center">
        <p className="eyebrow text-ink2 mb-4">Not found</p>
        <h1 className="font-display text-display text-ink">This stay has flown the nest.</h1>
        <p className="text-ink3 text-sm mt-3">It may have been delisted or moved.</p>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.title,
          text: `${listing.title} — ${listing.location}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard.");
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="bg-cream">
      <div className="container-page pt-10 md:pt-14 pb-22">
        {/* TITLE STRIP */}
        <ScrollReveal>
          <p className="eyebrow text-ink2 mb-4">{listing.propertyType?.toUpperCase()} · {listing.location?.split(",").slice(-1)[0]?.trim() || "Stay"}</p>
          <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
            <h1 className="font-display text-3xl md:text-5xl text-ink max-w-3xl leading-tight">
              {listing.title}
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="editorial" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="h-3.5 w-3.5" /> Share
              </Button>
              <Button
                variant="editorial"
                size="sm"
                onClick={() => setFavorited((f) => !f)}
                className="gap-2"
              >
                <Heart className={`h-3.5 w-3.5 ${favorited ? "fill-terracotta text-terracotta" : ""}`} />
                {favorited ? "Saved" : "Save"}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm text-ink2 flex-wrap">
            {typeof listing.rating === "number" && (
              <span className="flex items-center gap-1.5 text-ink">
                <Star className="h-4 w-4 fill-ochre text-ochre" />
                <span className="font-medium">{listing.rating.toFixed(2)}</span>
                <span className="text-ink3">· {listing.reviews ?? 0} reviews</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {listing.location}
            </span>
          </div>
        </ScrollReveal>

        {/* COLLAGE */}
        <ScrollReveal delay={0.1} className="mt-8">
          <ImageCollage images={listing.images} alt={listing.title} />
        </ScrollReveal>

        {/* TWO-COL */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 mt-16">
          {/* LEFT — content */}
          <div className="md:col-span-7 md:col-start-1 space-y-14">
            {/* Inline meta */}
            <ScrollReveal>
              <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-linen">
                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Hosted by {listing.host?.name ?? "the owner"}
                  </h2>
                  <p className="text-sm text-ink3 mt-1">
                    {listing.guests} guests · {listing.bedrooms} bedrooms · {listing.bathrooms} baths
                  </p>
                </div>
                <Avatar className="h-14 w-14 border border-linen">
                  <AvatarImage src={listing.host?.avatar} />
                  <AvatarFallback className="bg-bone text-ink">
                    {listing.host?.name?.[0] ?? "H"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </ScrollReveal>

            {/* Quick promises */}
            <ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-linen">
                <PromiseRow icon={<Sparkles className="h-5 w-5" />} title="Editor-curated" body="Visited and verified before listing." />
                <PromiseRow icon={<ShieldCheck className="h-5 w-5" />} title="Trusted host" body={`${listing.host?.name ?? "Host"} since ${memberSince}.`} />
                <PromiseRow icon={<Clock className="h-5 w-5" />} title="Flexible cancellation" body="Free up to 5 days before arrival." />
              </div>
            </ScrollReveal>

            {/* Description */}
            <ScrollReveal>
              <div>
                <p className="eyebrow text-ink2 mb-4">About this stay</p>
                <p className="text-ink2 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            </ScrollReveal>

            {/* Amenities */}
            <ScrollReveal>
              <div>
                <p className="eyebrow text-ink2 mb-6">Amenities</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
                  {listing.amenities.map((amenity) => {
                    const meta = AMENITY_META[amenity];
                    const label = meta?.label ?? amenity.charAt(0).toUpperCase() + amenity.slice(1);
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-4 py-4 border-b border-linen last:border-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-0 text-ink"
                      >
                        <span className="text-ink2">
                          {meta?.icon ?? <Sparkles className="h-5 w-5" />}
                        </span>
                        <span className="text-sm">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>

            {/* Reviews stub */}
            <ScrollReveal>
              <div className="bg-bone rounded-sm p-8 md:p-10">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 fill-ochre text-ochre" />
                    <p className="font-display text-2xl text-ink">
                      {listing.rating?.toFixed(2) ?? "—"} <span className="text-ink3 text-base">· {listing.reviews ?? 0} reviews</span>
                    </p>
                  </div>
                  <p className="eyebrow text-ink3">Coming soon</p>
                </div>
                <p className="text-sm text-ink2 max-w-md leading-relaxed">
                  Guest reviews are under construction. Until then, every home you see has been
                  vetted in person by our editorial team.
                </p>
              </div>
            </ScrollReveal>

            {/* Location stub */}
            <ScrollReveal>
              <div>
                <p className="eyebrow text-ink2 mb-6">Where you'll be</p>
                <div className="aspect-[16/10] rounded-sm bg-bone flex items-center justify-center text-ink2">
                  <div className="text-center">
                    <MapPin className="h-6 w-6 mx-auto mb-2 text-ink3" />
                    <p className="font-display text-xl text-ink">{listing.location}</p>
                    <p className="text-xs text-ink3 mt-1">Interactive map coming soon</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* RIGHT — sticky booking */}
          <aside className="md:col-span-5 md:col-start-8">
            <div className="md:sticky md:top-28">
              {isHost ? (
                <div className="bg-cream border border-linen rounded-sm p-7 shadow-card">
                  <p className="eyebrow text-ink2 mb-3">Your listing</p>
                  <p className="font-display text-xl text-ink mb-4">
                    Bookings live in your dashboard.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/host/bookings">View bookings</a>
                  </Button>
                </div>
              ) : (
                <BookingForm
                  listingId={listing._id}
                  price={listing.price}
                  maxGuests={listing.guests}
                />
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

function PromiseRow({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div>
      <div className="text-terracotta mb-3">{icon}</div>
      <p className="font-display text-base text-ink">{title}</p>
      <p className="text-sm text-ink3 mt-1 leading-relaxed">{body}</p>
    </div>
  );
}

function ListingDetailsSkeleton() {
  return (
    <div className="container-page pt-10 md:pt-14 pb-22 animate-soft-pulse">
      <Skeleton className="h-4 w-40 mb-4 bg-bone" />
      <Skeleton className="h-12 w-2/3 mb-6 bg-bone" />
      <Skeleton className="h-4 w-72 bg-bone" />
      <div className="aspect-[16/9] md:h-[480px] bg-bone rounded-sm mt-8" />
      <div className="grid grid-cols-12 gap-16 mt-16">
        <div className="col-span-7 space-y-6">
          <Skeleton className="h-6 w-1/2 bg-bone" />
          <Skeleton className="h-4 w-full bg-bone" />
          <Skeleton className="h-4 w-full bg-bone" />
          <Skeleton className="h-4 w-3/4 bg-bone" />
        </div>
        <div className="col-span-5">
          <Skeleton className="h-[420px] bg-bone rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export default ListingDetails;
