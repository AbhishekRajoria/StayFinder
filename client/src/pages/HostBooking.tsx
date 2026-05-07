import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";

import { getHostBookings } from "@/api/bookingApi";
import { Booking } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/editorial";

export default function HostBooking() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getHostBookings();
        setBookings(res.bookings);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to fetch bookings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="bg-cream min-h-screen">
      <section className="container-page pt-12 md:pt-20 pb-12">
        <p className="eyebrow text-ink2 mb-4">Hosting</p>
        <h1 className="font-display text-display text-ink">Reservations.</h1>
        <p className="text-ink2 text-sm mt-3">
          Every guest who's booked across your collection.
        </p>
      </section>

      <section className="container-page pb-22">
        {isLoading ? (
          <div className="space-y-0">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-8 py-10 border-b border-linen animate-soft-pulse"
              >
                <Skeleton className="col-span-3 aspect-[4/3] bg-bone rounded-sm" />
                <div className="col-span-6 space-y-3">
                  <Skeleton className="h-3 w-24 bg-bone" />
                  <Skeleton className="h-6 w-2/3 bg-bone" />
                  <Skeleton className="h-3 w-40 bg-bone" />
                </div>
                <div className="col-span-3" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-bone rounded-sm p-12 max-w-lg">
            <p className="eyebrow text-ink2 mb-3">Quiet for now</p>
            <p className="font-display text-2xl text-ink leading-snug">
              No reservations yet.
            </p>
            <p className="text-ink2 text-sm mt-3 leading-relaxed">
              Once a guest books one of your homes, they'll appear here with all the
              details you need.
            </p>
            <Button asChild className="mt-7">
              <Link to="/my-listings">View your listings</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-0">
            {bookings.map((b) => (
              <ScrollReveal
                key={b._id}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 py-8 md:py-10 border-b border-linen items-start md:items-center"
              >
                <div className="md:col-span-3">
                  <Link
                    to={`/listings/${b.listing?._id}`}
                    className="block aspect-[4/3] overflow-hidden rounded-sm bg-bone group"
                  >
                    {b.listing?.images?.[0] && (
                      <img
                        src={b.listing.images[0]}
                        alt={b.listing.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    )}
                  </Link>
                </div>
                <div className="md:col-span-5">
                  <p className="eyebrow text-ink2">{b.listing?.location}</p>
                  <Link
                    to={`/listings/${b.listing?._id}`}
                    className="block font-display text-2xl text-ink mt-2 leading-snug hover:text-terracotta transition-colors"
                  >
                    {b.listing?.title || "Untitled stay"}
                  </Link>
                  <p className="text-sm text-ink2 mt-3">
                    {format(new Date(b.startDate), "MMM d")} → {format(new Date(b.endDate), "MMM d, yyyy")} · {b.nights} {b.nights === 1 ? "night" : "nights"} · {b.guests} {b.guests === 1 ? "guest" : "guests"}
                  </p>
                </div>
                <div className="md:col-span-4 flex flex-col items-start md:items-end gap-3">
                  <span
                    className={`eyebrow rounded-full px-3 py-1.5 ${
                      b.status === "confirmed"
                        ? "bg-forest/10 text-forest"
                        : b.status === "cancelled"
                          ? "bg-danger/10 text-danger"
                          : "bg-ochre/10 text-ochre"
                    }`}
                  >
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                  <p className="font-display text-2xl text-ink">${b.totalPrice}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
