import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { format, isAfter, isBefore } from "date-fns";

import { getMyBookings, cancelBooking } from "@/api/bookingApi";
import { Booking } from "@/types/booking";
import { PayNowButton } from "@/components/listing/PayNowButton";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/editorial";
import { Skeleton } from "@/components/ui/skeleton";

type Tab = "upcoming" | "past" | "cancelled";

const TAB_COPY: Record<Tab, string> = {
  upcoming: "Upcoming",
  past: "Past",
  cancelled: "Cancelled",
};

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("upcoming");
  const navigate = useNavigate();
  const location = useLocation();

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data.bookings);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle Stripe redirect query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get("success");
    const canceled = params.get("canceled");
    const bookingId = params.get("booking_id");

    if (bookingId) {
      if (success === "true") {
        toast.success("Payment successful. Your booking is confirmed.");
        fetchBookings();
      } else if (canceled === "true") {
        toast.error("Payment cancelled.");
      }
      params.delete("success");
      params.delete("canceled");
      params.delete("booking_id");
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  }, [location.search, navigate]);

  const handleCancel = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b)),
      );
      toast.success("Booking cancelled.");
    } catch {
      toast.error("Couldn't cancel that booking.");
    }
  };

  const filtered = useMemo(() => {
    const now = new Date();
    return bookings.filter((b) => {
      if (tab === "cancelled") return b.status === "cancelled";
      const end = new Date(b.endDate);
      const isPast = isBefore(end, now);
      if (b.status === "cancelled") return false;
      if (tab === "upcoming") return !isPast || isAfter(end, now);
      return isPast;
    });
  }, [bookings, tab]);

  const counts = useMemo(() => {
    const now = new Date();
    return {
      upcoming: bookings.filter((b) => b.status !== "cancelled" && !isBefore(new Date(b.endDate), now)).length,
      past: bookings.filter((b) => b.status !== "cancelled" && isBefore(new Date(b.endDate), now)).length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  return (
    <div className="bg-cream min-h-screen">
      <section className="container-page pt-12 md:pt-20 pb-10">
        <p className="eyebrow text-ink2 mb-4">Your travels</p>
        <h1 className="font-display text-display text-ink">Bookings.</h1>
      </section>

      {/* Text-link tabs */}
      <div className="border-b border-linen sticky top-16 md:top-20 z-30 bg-cream/95 backdrop-blur">
        <div className="container-page flex gap-8 overflow-x-auto scrollbar-hide">
          {(Object.keys(TAB_COPY) as Tab[]).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`relative py-5 eyebrow transition-colors ${
                  active ? "text-ink" : "text-ink3 hover:text-ink"
                }`}
              >
                {TAB_COPY[t]}
                <span className="text-ink3 ml-2">{counts[t]}</span>
                {active && (
                  <span className="absolute bottom-0 inset-x-0 h-px bg-ink" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <section className="container-page py-12 md:py-16">
        {isLoading ? (
          <div className="space-y-12">
            {Array.from({ length: 2 }).map((_, i) => (
              <BookingRowSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <ScrollReveal>
            <div className="max-w-md py-20">
              <p className="eyebrow text-ink2 mb-4">Nothing here yet</p>
              <p className="font-display text-3xl text-ink leading-tight">
                Your stays will live here.
              </p>
              <p className="text-ink2 text-sm mt-4 max-w-sm leading-relaxed">
                Once you book, every check-in, check-out, and good night's sleep
                will appear in this feed.
              </p>
              <Button asChild className="mt-8">
                <Link to="/listings">Browse stays</Link>
              </Button>
            </div>
          </ScrollReveal>
        ) : (
          <div className="space-y-0">
            {filtered.map((b) => (
              <BookingRow
                key={b._id}
                booking={b}
                onCancel={() => handleCancel(b._id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BookingRow({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel: () => void;
}) {
  const startD = new Date(booking.startDate);
  const endD = new Date(booking.endDate);
  const image = booking.listing?.images?.[0];

  const statusColor =
    booking.status === "confirmed"
      ? "text-forest"
      : booking.status === "cancelled"
        ? "text-danger"
        : "text-ochre";
  const statusBg =
    booking.status === "confirmed"
      ? "bg-forest/10"
      : booking.status === "cancelled"
        ? "bg-danger/10"
        : "bg-ochre/10";

  return (
    <ScrollReveal className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 py-8 md:py-10 border-b border-linen items-start md:items-center">
      {/* Image */}
      <div className="md:col-span-3">
        <Link
          to={`/listings/${booking.listing?._id}`}
          className="block aspect-[4/3] overflow-hidden rounded-sm bg-bone group"
        >
          {image ? (
            <img
              src={image}
              alt={booking.listing?.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink3 text-xs">No image</div>
          )}
        </Link>
      </div>

      {/* Details */}
      <div className="md:col-span-6">
        <p className="eyebrow text-ink2">{booking.listing?.location ?? "Location"}</p>
        <Link
          to={`/listings/${booking.listing?._id}`}
          className="block font-display text-2xl text-ink mt-2 leading-snug hover:text-terracotta transition-colors"
        >
          {booking.listing?.title || "Untitled stay"}
        </Link>
        <p className="text-sm text-ink2 mt-3">
          {format(startD, "MMM d")} → {format(endD, "MMM d, yyyy")} · {booking.nights} {booking.nights === 1 ? "night" : "nights"}
        </p>
      </div>

      {/* Status + price + actions */}
      <div className="md:col-span-3 flex flex-col items-start md:items-end gap-3">
        <span
          className={`eyebrow rounded-full px-3 py-1.5 ${statusBg} ${statusColor}`}
        >
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
        <p className="font-display text-2xl text-ink">${booking.totalPrice}</p>
        <div className="flex flex-col items-start md:items-end gap-2">
          {booking.paymentStatus === "unpaid" && booking.status !== "cancelled" && (
            <PayNowButton
              bookingId={booking._id}
              totalPrice={booking.totalPrice}
            />
          )}
          {booking.status !== "cancelled" && (
            <button
              type="button"
              onClick={onCancel}
              className="eyebrow text-ink3 hover:text-danger transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}

function BookingRowSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-8 py-10 border-b border-linen animate-soft-pulse">
      <Skeleton className="col-span-3 aspect-[4/3] bg-bone rounded-sm" />
      <div className="col-span-6 space-y-3">
        <Skeleton className="h-3 w-24 bg-bone" />
        <Skeleton className="h-6 w-2/3 bg-bone" />
        <Skeleton className="h-3 w-40 bg-bone" />
      </div>
      <div className="col-span-3 space-y-3 flex flex-col items-end">
        <Skeleton className="h-5 w-20 bg-bone" />
        <Skeleton className="h-7 w-16 bg-bone" />
      </div>
    </div>
  );
}
