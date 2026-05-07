import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getListings } from "@/api/listingApi";
import { Listing } from "@/types/listing";
import { useToast } from "@/components/ui/use-toast";
import { SlidersHorizontal } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const AMENITIES = [
  "wifi",
  "parking",
  "pool",
  "garden",
  "fireplace",
  "kitchen",
  "tv",
  "ac",
  "washer",
  "dryer",
  "elevator",
  "gym",
];

const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "condo", label: "Condo" },
  { value: "studio", label: "Studio" },
];

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minGuests: searchParams.get("minGuests") || "",
    maxGuests: searchParams.get("maxGuests") || "",
    minBedrooms: searchParams.get("minBedrooms") || "",
    maxBedrooms: searchParams.get("maxBedrooms") || "",
    minBathrooms: searchParams.get("minBathrooms") || "",
    maxBathrooms: searchParams.get("maxBathrooms") || "",
    propertyType: searchParams.get("propertyType") || "",
    amenities: searchParams.getAll("amenities") || [],
    sort: searchParams.get("sort") || "createdAt",
    order: searchParams.get("order") || "desc",
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const params = {
          search: filters.search || undefined,
          location: filters.location || undefined,
          minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
          maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
          minGuests: filters.minGuests ? Number(filters.minGuests) : undefined,
          maxGuests: filters.maxGuests ? Number(filters.maxGuests) : undefined,
          minBedrooms: filters.minBedrooms ? Number(filters.minBedrooms) : undefined,
          maxBedrooms: filters.maxBedrooms ? Number(filters.maxBedrooms) : undefined,
          minBathrooms: filters.minBathrooms ? Number(filters.minBathrooms) : undefined,
          maxBathrooms: filters.maxBathrooms ? Number(filters.maxBathrooms) : undefined,
          propertyType: filters.propertyType || undefined,
          amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
          sort: filters.sort || undefined,
          order: filters.order as "asc" | "desc" | undefined,
        };

        const response = await getListings(params);
        setListings(response.data.listings);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch listings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters, toast]);

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | string[]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else if (value) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const emptyFilters = {
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
    setFilters(emptyFilters);
    setSearchParams({});
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => (Array.isArray(value) ? value.length > 0 : value)
  ).length;

    return (
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Search Listings</h1>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search</label>
                      <Input
                        placeholder="Search by title, description, or location"
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Input
                        placeholder="Enter location"
                        value={filters.location}
                        onChange={(e) => handleFilterChange("location", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price Range</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min price"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Max price"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Guests</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min guests"
                          value={filters.minGuests}
                          onChange={(e) => handleFilterChange("minGuests", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Max guests"
                          value={filters.maxGuests}
                          onChange={(e) => handleFilterChange("maxGuests", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bedrooms</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min bedrooms"
                          value={filters.minBedrooms}
                          onChange={(e) => handleFilterChange("minBedrooms", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Max bedrooms"
                          value={filters.maxBedrooms}
                          onChange={(e) => handleFilterChange("maxBedrooms", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bathrooms</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min bathrooms"
                          value={filters.minBathrooms}
                          onChange={(e) => handleFilterChange("minBathrooms", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Max bathrooms"
                          value={filters.maxBathrooms}
                          onChange={(e) => handleFilterChange("maxBathrooms", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Property Type</label>
                      <Select
                        value={filters.propertyType}
                        onValueChange={(value) => handleFilterChange("propertyType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROPERTY_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amenities</label>
                      <div className="flex flex-wrap gap-2">
                        {AMENITIES.map((amenity) => (
                          <Badge
                            key={amenity}
                            variant={filters.amenities.includes(amenity) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const newAmenities = filters.amenities.includes(amenity)
                                ? filters.amenities.filter((a) => a !== amenity)
                                : [...filters.amenities, amenity];
                              handleFilterChange("amenities", newAmenities);
                            }}
                          >
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sort By</label>
                      <Select
                        value={filters.sort}
                        onValueChange={(value) => handleFilterChange("sort", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="createdAt">Newest</SelectItem>
                          <SelectItem value="guests">Guests</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Order</label>
                      <Select
                        value={filters.order}
                        onValueChange={(value) => handleFilterChange("order", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Order" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Ascending</SelectItem>
                          <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Search by title, description, or location"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="max-w-md"
          />
          <Input
            placeholder="Location"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No listings found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => (
          <Card key={listing._id} className="overflow-hidden">
              <div className="aspect-video relative">
              <img
                src={listing.images[0]}
                alt={listing.title}
                  className="object-cover w-full h-full"
              />
            </div>
            <CardHeader>
                <CardTitle className="text-xl">{listing.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600 mb-4">{listing.location}</p>
                <div className="flex justify-between items-center">
                  <p className="font-semibold">${listing.price}/night</p>
                  <Button asChild>
                    <Link to={`/listings/${listing._id}`}>View Details</Link>
                  </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
} 