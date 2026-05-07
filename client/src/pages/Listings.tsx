import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X, MapPin, LayoutGrid } from "lucide-react";

import { getListings } from "@/api/listingApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ListingCardEditorial,
  ListingCardSkeleton,
  ScrollReveal,
} from "@/components/editorial";

const AMENITIES = [
  "wifi", "parking", "pool", "garden", "fireplace", "kitchen",
  "tv", "ac", "washer", "dryer", "elevator", "gym",
];

const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "condo", label: "Condo" },
  { value: "studio", label: "Studio" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest" },
  { value: "price", label: "Price" },
  { value: "guests", label: "Capacity" },
];

type Filters = {
  search: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  minGuests: string;
  maxGuests: string;
  minBedrooms: string;
  maxBedrooms: string;
  minBathrooms: string;
  maxBathrooms: string;
  propertyType: string;
  amenities: string[];
  sort: string;
  order: string;
};

const emptyFilters: Filters = {
  search: "",
  location: "",
  minPrice: "",
  maxPrice: "",
  minGuests: "",
  maxGuests: "",
  minBedrooms: "",
  maxBedrooms: "",
  minBathrooms: "",
  maxBathrooms: "",
  propertyType: "",
  amenities: [],
  sort: "createdAt",
  order: "desc",
};

function readFilters(params: URLSearchParams): Filters {
  return {
    search: params.get("search") ?? "",
    location: params.get("location") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    minGuests: params.get("minGuests") ?? "",
    maxGuests: params.get("maxGuests") ?? "",
    minBedrooms: params.get("minBedrooms") ?? "",
    maxBedrooms: params.get("maxBedrooms") ?? "",
    minBathrooms: params.get("minBathrooms") ?? "",
    maxBathrooms: params.get("maxBathrooms") ?? "",
    propertyType: params.get("propertyType") ?? "",
    amenities: params.getAll("amenities"),
    sort: params.get("sort") ?? "createdAt",
    order: params.get("order") ?? "desc",
  };
}

function writeFilters(f: Filters): URLSearchParams {
  const out = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      v.forEach((x) => out.append(k, x));
    } else if (v && !(k === "sort" && v === "createdAt") && !(k === "order" && v === "desc")) {
      out.set(k, v as string);
    }
  });
  return out;
}

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => readFilters(searchParams));
  const [view, setView] = useState<"grid" | "map">("grid");

  // Debounce text inputs so we don't slam the API
  const debouncedSearch = useDebouncedValue(filters.search, 350);
  const debouncedLocation = useDebouncedValue(filters.location, 350);

  // URL sync
  useEffect(() => {
    setSearchParams(writeFilters(filters), { replace: true });
  }, [filters, setSearchParams]);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      location: debouncedLocation || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      minGuests: filters.minGuests ? Number(filters.minGuests) : undefined,
      maxGuests: filters.maxGuests ? Number(filters.maxGuests) : undefined,
      minBedrooms: filters.minBedrooms ? Number(filters.minBedrooms) : undefined,
      maxBedrooms: filters.maxBedrooms ? Number(filters.maxBedrooms) : undefined,
      minBathrooms: filters.minBathrooms ? Number(filters.minBathrooms) : undefined,
      maxBathrooms: filters.maxBathrooms ? Number(filters.maxBathrooms) : undefined,
      propertyType: filters.propertyType || undefined,
      amenities: filters.amenities.length ? filters.amenities : undefined,
      sort: filters.sort || undefined,
      order: filters.order as "asc" | "desc" | undefined,
    }),
    [debouncedSearch, debouncedLocation, filters],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["listings", "search", queryParams],
    queryFn: () => getListings(queryParams),
    staleTime: 1000 * 60,
  });

  const listings = data?.data?.listings ?? [];
  const total = data?.data?.pagination?.total ?? 0;

  const update = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const clearFilters = () => setFilters(emptyFilters);

  const activeCount = Object.entries(filters).reduce((n, [k, v]) => {
    if (k === "sort" || k === "order") return n;
    if (Array.isArray(v)) return n + (v.length > 0 ? 1 : 0);
    return n + (v ? 1 : 0);
  }, 0);

  const togglePropertyType = (val: string) =>
    update("propertyType", filters.propertyType === val ? "" : val);

  return (
    <div className="bg-cream min-h-screen">
      {/* PAGE HEADER */}
      <section className="container-page pt-16 md:pt-24 pb-10">
        <p className="eyebrow text-ink2 mb-4">The collection</p>
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <h1 className="font-display text-display text-ink">All stays.</h1>
          <p className="text-ink3 text-sm">
            {isLoading ? "Searching…" : `${total} ${total === 1 ? "stay" : "stays"} available`}
          </p>
        </div>
      </section>

      {/* STICKY FILTER BAR */}
      <div className="sticky top-16 md:top-20 z-30 bg-cream/90 backdrop-blur-md border-y border-linen">
        <div className="container-page py-4 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {/* Property type pills */}
          <div className="flex gap-2 shrink-0">
            {PROPERTY_TYPES.map((pt) => {
              const active = filters.propertyType === pt.value;
              return (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => togglePropertyType(pt.value)}
                  className={`eyebrow rounded-full px-4 py-2 border transition-colors ${
                    active
                      ? "bg-ink text-cream border-ink"
                      : "bg-transparent text-ink border-ink/15 hover:border-ink"
                  }`}
                >
                  {pt.label}
                </button>
              );
            })}
          </div>

          <span className="hidden md:block w-px h-6 bg-linen mx-2" />

          {/* Search input — underline */}
          <div className="hidden md:flex items-center gap-3 flex-1 min-w-[200px] max-w-md">
            <Input
              variant="underline"
              placeholder="Search by name, place, vibe"
              value={filters.search}
              onChange={(e) => update("search", e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="hidden md:block shrink-0">
            <Select value={filters.sort} onValueChange={(v) => update("sort", v)}>
              <SelectTrigger className="w-36 border-0 border-b border-linen rounded-none focus:ring-0 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto flex gap-2 shrink-0">
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                  {activeCount > 0 && (
                    <Badge className="ml-1 bg-terracotta text-cream hover:bg-terracotta">
                      {activeCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-cream border-linen w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl text-ink">Refine</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] pr-4 mt-6">
                  <div className="space-y-8 py-2">
                    <FieldGroup label="Location">
                      <Input
                        variant="underline"
                        placeholder="Where to?"
                        value={filters.location}
                        onChange={(e) => update("location", e.target.value)}
                      />
                    </FieldGroup>

                    <FieldGroup label="Price ($/night)">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          variant="underline"
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => update("minPrice", e.target.value)}
                        />
                        <Input
                          variant="underline"
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => update("maxPrice", e.target.value)}
                        />
                      </div>
                    </FieldGroup>

                    <FieldGroup label="Guests">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          variant="underline"
                          type="number"
                          placeholder="Min"
                          value={filters.minGuests}
                          onChange={(e) => update("minGuests", e.target.value)}
                        />
                        <Input
                          variant="underline"
                          type="number"
                          placeholder="Max"
                          value={filters.maxGuests}
                          onChange={(e) => update("maxGuests", e.target.value)}
                        />
                      </div>
                    </FieldGroup>

                    <FieldGroup label="Bedrooms">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          variant="underline"
                          type="number"
                          placeholder="Min"
                          value={filters.minBedrooms}
                          onChange={(e) => update("minBedrooms", e.target.value)}
                        />
                        <Input
                          variant="underline"
                          type="number"
                          placeholder="Max"
                          value={filters.maxBedrooms}
                          onChange={(e) => update("maxBedrooms", e.target.value)}
                        />
                      </div>
                    </FieldGroup>

                    <FieldGroup label="Bathrooms">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          variant="underline"
                          type="number"
                          placeholder="Min"
                          value={filters.minBathrooms}
                          onChange={(e) => update("minBathrooms", e.target.value)}
                        />
                        <Input
                          variant="underline"
                          type="number"
                          placeholder="Max"
                          value={filters.maxBathrooms}
                          onChange={(e) => update("maxBathrooms", e.target.value)}
                        />
                      </div>
                    </FieldGroup>

                    <FieldGroup label="Amenities">
                      <div className="flex flex-wrap gap-2">
                        {AMENITIES.map((amenity) => {
                          const active = filters.amenities.includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => {
                                update(
                                  "amenities",
                                  active
                                    ? filters.amenities.filter((a) => a !== amenity)
                                    : [...filters.amenities, amenity],
                                );
                              }}
                              className={`eyebrow rounded-full px-3 py-1.5 border transition-colors ${
                                active
                                  ? "bg-ink text-cream border-ink"
                                  : "bg-transparent text-ink border-ink/15 hover:border-ink"
                              }`}
                            >
                              {amenity}
                            </button>
                          );
                        })}
                      </div>
                    </FieldGroup>

                    <FieldGroup label="Sort by">
                      <div className="grid grid-cols-2 gap-4">
                        <Select value={filters.sort} onValueChange={(v) => update("sort", v)}>
                          <SelectTrigger className="border-0 border-b border-linen rounded-none focus:ring-0 bg-transparent px-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SORT_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={filters.order} onValueChange={(v) => update("order", v)}>
                          <SelectTrigger className="border-0 border-b border-linen rounded-none focus:ring-0 bg-transparent px-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="asc">Low to high</SelectItem>
                            <SelectItem value="desc">High to low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FieldGroup>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            {/* Map / grid toggle */}
            <div className="hidden md:flex border border-ink/15 rounded-full overflow-hidden">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`eyebrow px-3 py-2 flex items-center gap-1.5 transition-colors ${
                  view === "grid" ? "bg-ink text-cream" : "bg-transparent text-ink hover:bg-linen"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
              </button>
              <button
                type="button"
                onClick={() => setView("map")}
                className={`eyebrow px-3 py-2 flex items-center gap-1.5 transition-colors ${
                  view === "map" ? "bg-ink text-cream" : "bg-transparent text-ink hover:bg-linen"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" /> Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS */}
      <section className="container-page py-12 md:py-20">
        {view === "map" ? (
          <div className="aspect-[16/10] rounded-sm bg-bone flex items-center justify-center text-ink2">
            <div className="text-center max-w-sm">
              <p className="eyebrow text-ink2 mb-3">Map view</p>
              <p className="font-display text-2xl text-ink">Arriving with the next wave.</p>
              <p className="text-sm text-ink3 mt-3">
                Pin-to-card sync with Leaflet ships in the next release.
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24">
            <p className="eyebrow text-ink2 mb-4">No matches</p>
            <p className="font-display text-2xl text-ink">
              We couldn't find a stay for that.
            </p>
            <p className="text-ink3 text-sm mt-3 max-w-sm mx-auto">
              Try widening your dates, dropping a filter, or browsing destinations.
            </p>
            <Button onClick={clearFilters} variant="editorial" className="mt-8">
              Reset filters
            </Button>
          </div>
        ) : (
          <ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
              {listings.map((listing) => (
                <ListingCardEditorial
                  key={listing._id}
                  listing={listing}
                  eyebrow={`${listing.propertyType?.toUpperCase() ?? "STAY"} · ${listing.location?.split(",")[0] ?? ""}`}
                />
              ))}
            </div>
          </ScrollReveal>
        )}
      </section>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="eyebrow text-ink">{label}</p>
      {children}
    </div>
  );
}
