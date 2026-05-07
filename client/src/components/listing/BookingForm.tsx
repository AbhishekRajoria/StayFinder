import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format, isWithinInterval, startOfDay } from "date-fns";
import { CalendarIcon, Loader2, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createBooking } from "@/api/bookingApi";
import { getListingBookings } from "@/api/listingApi";

interface BookingFormProps {
  listingId: string;
  price: number;
  maxGuests: number;
  /** When `compact`, render without outer card chrome (used inline in modals). */
  compact?: boolean;
}

interface BookedDate {
  startDate: string;
  endDate: string;
}

/**
 * Editorial booking widget. Shown as a sticky right-rail on ListingDetails.
 * Date pickers via Popover, guest stepper, total breakdown in Fraunces.
 * Disables booked intervals based on /listings/:id/bookings response.
 */
export const BookingForm = ({ listingId, price, maxGuests, compact = false }: BookingFormProps) => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await getListingBookings(listingId);
        setBookedDates(r);
      } catch {
        /* silent — empty state still works */
      }
    };
    fetch();
  }, [listingId]);

  const nights =
    startDate && endDate
      ? Math.max(0, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

  const cleaningFee = nights > 0 ? 35 : 0;
  const subtotal = nights * price;
  const total = subtotal + cleaningFee;

  const isDateBooked = (date: Date): boolean => {
    const normalized = startOfDay(date);
    return bookedDates.some(({ startDate, endDate }) => {
      const start = startOfDay(new Date(startDate));
      const end = startOfDay(new Date(endDate));
      return isWithinInterval(normalized, { start, end });
    });
  };

  const allBookedDays = bookedDates.flatMap(({ startDate, endDate }) => {
    const start = startOfDay(new Date(startDate));
    const end = startOfDay(new Date(endDate));
    const days: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  });

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      toast.error("Choose your check-in and check-out dates first.");
      return;
    }
    setIsLoading(true);
    try {
      await createBooking({
        listing: listingId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        guests,
      });
      toast.success("Reserved. See you soon.");
      navigate("/bookings");
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Booking failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const widget = (
    <div className="space-y-7">
      {/* Price line */}
      <div className="flex items-baseline gap-2">
        <p className="font-display text-3xl text-ink leading-none">${price}</p>
        <p className="text-ink3 text-sm">per night</p>
      </div>

      {/* Date pickers — paired underline buttons */}
      <div className="grid grid-cols-2 border-y border-linen divide-x divide-linen">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex flex-col items-start gap-1 px-3 py-3 hover:bg-linen/50 text-left transition-colors",
                !startDate && "text-ink3"
              )}
            >
              <span className="eyebrow text-ink2">Check in</span>
              <span className="text-sm text-ink flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {startDate ? format(startDate, "MMM d") : "Add date"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-cream border-linen" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              disabled={(date) =>
                date < startOfDay(new Date()) ||
                isDateBooked(date) ||
                (endDate ? date >= endDate : false)
              }
              modifiers={{ booked: allBookedDays }}
              modifiersClassNames={{
                booked: "line-through text-ink3 hover:bg-transparent hover:text-ink3 cursor-not-allowed",
              }}
              className="rounded-sm border-0 bg-cream text-sm p-3"
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex flex-col items-start gap-1 px-3 py-3 hover:bg-linen/50 text-left transition-colors",
                !endDate && "text-ink3"
              )}
            >
              <span className="eyebrow text-ink2">Check out</span>
              <span className="text-sm text-ink flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {endDate ? format(endDate, "MMM d") : "Add date"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-cream border-linen" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              disabled={(date) =>
                !startDate ||
                date <= startDate ||
                date < startOfDay(new Date()) ||
                isDateBooked(date)
              }
              modifiers={{ booked: allBookedDays }}
              modifiersClassNames={{
                booked: "line-through text-ink3 hover:bg-transparent hover:text-ink3 cursor-not-allowed",
              }}
              className="rounded-sm border-0 bg-cream text-sm p-3"
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Guests stepper */}
      <div className="flex items-center justify-between border-b border-linen pb-4">
        <div>
          <p className="eyebrow text-ink2">Guests</p>
          <p className="text-sm text-ink mt-1">
            {guests} {guests === 1 ? "guest" : "guests"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            disabled={guests <= 1}
            className="h-9 w-9 rounded-full border border-ink/15 hover:border-ink disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            aria-label="Decrease guests"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center text-sm tabular-nums">{guests}</span>
          <button
            type="button"
            onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
            disabled={guests >= maxGuests}
            className="h-9 w-9 rounded-full border border-ink/15 hover:border-ink disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            aria-label="Increase guests"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Total breakdown */}
      {nights > 0 && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-ink2">
            <span>${price} × {nights} {nights === 1 ? "night" : "nights"}</span>
            <span>${subtotal}</span>
          </div>
          <div className="flex justify-between text-ink2">
            <span>Cleaning fee</span>
            <span>${cleaningFee}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-linen items-baseline">
            <span className="eyebrow text-ink">Total</span>
            <span className="font-display text-2xl text-ink">${total}</span>
          </div>
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={handleBooking}
        disabled={!startDate || !endDate || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Reserving…
          </>
        ) : (
          "Reserve"
        )}
      </Button>

      <p className="text-xs text-ink3 text-center">You won't be charged yet.</p>
    </div>
  );

  if (compact) return widget;

  return (
    <div className="bg-cream border border-linen rounded-sm p-7 shadow-card">
      {widget}
    </div>
  );
};
