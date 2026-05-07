import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { X, Upload, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createListing as createListingApi } from "@/api/listingApi";
import { ScrollReveal } from "@/components/editorial";

const formSchema = z.object({
  title: z.string().min(1, "Tell us what to call this stay."),
  description: z.string().min(1, "Describe what makes it special."),
  location: z.string().min(1, "Where is it?"),
  price: z.number().min(0, "Price must be a positive number."),
  propertyType: z.enum(["house", "apartment", "villa", "condo", "studio"]),
  guests: z.number().min(1, "At least one guest."),
  bedrooms: z.number().min(1, "At least one bedroom."),
  bathrooms: z.number().min(1, "At least one bathroom."),
  amenities: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "condo", label: "Condo" },
  { value: "studio", label: "Studio" },
];

const AMENITIES = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "pool", label: "Pool" },
  { value: "kitchen", label: "Kitchen" },
  { value: "parking", label: "Parking" },
  { value: "ac", label: "Air conditioning" },
  { value: "washer", label: "Washer" },
  { value: "dryer", label: "Dryer" },
  { value: "tv", label: "Television" },
  { value: "gym", label: "Gym" },
  { value: "elevator", label: "Elevator" },
  { value: "fireplace", label: "Fireplace" },
  { value: "garden", label: "Garden" },
];

export function CreateListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      price: 0,
      propertyType: "house",
      guests: 1,
      bedrooms: 1,
      bathrooms: 1,
      amenities: [],
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
    if (valid.length !== files.length) toast.error("Skipped some files — images up to 5MB only.");
    setSelectedFiles((prev) => [...prev, ...valid]);
    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrls((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    if (selectedFiles.length === 0) {
      toast.error("Add at least one photograph.");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "amenities") {
          (value as string[]).forEach((a) => formData.append("amenities[]", a));
        } else {
          formData.append(key, value.toString());
        }
      });
      selectedFiles.forEach((file) => formData.append("images", file));
      await createListingApi(formData);
      toast.success("Listing published.");
      navigate("/my-listings");
    } catch (error) {
      console.error(error);
      toast.error("We couldn't publish that. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <ScrollReveal className="container-page pt-12 md:pt-20 pb-10">
        <p className="eyebrow text-ink2 mb-4">Hosting</p>
        <h1 className="font-display text-display text-ink leading-tight">
          List your home.
        </h1>
        <p className="text-ink2 text-sm mt-3 max-w-md leading-relaxed">
          Tell us what's distinctive. Honest details and a few good photographs go further
          than polish.
        </p>
      </ScrollReveal>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormSection eyebrow="01" title="The basics">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="eyebrow text-ink2">Listing name</FormLabel>
                  <FormControl>
                    <Input variant="underline" placeholder="A cliffside villa with a private cove" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-danger" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="eyebrow text-ink2">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What does it feel like to wake up there?"
                      className="min-h-[140px] bg-transparent border-0 border-b border-linen rounded-none focus-visible:ring-0 focus-visible:border-ink px-0 text-ink placeholder:text-ink3 transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-danger" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="eyebrow text-ink2">Location</FormLabel>
                  <FormControl>
                    <Input variant="underline" placeholder="Tulum, Mexico" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-danger" />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection eyebrow="02" title="Pricing & type">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="eyebrow text-ink2">Price per night ($)</FormLabel>
                    <FormControl>
                      <Input
                        variant="underline"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="220"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-danger" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="eyebrow text-ink2">Property type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-0 border-b border-linen rounded-none px-0 focus:ring-0 bg-transparent">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-cream border-linen">
                        {PROPERTY_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-danger" />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          <FormSection eyebrow="03" title="Capacity">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {(["guests", "bedrooms", "bathrooms"] as const).map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="eyebrow text-ink2">{name.charAt(0).toUpperCase() + name.slice(1)}</FormLabel>
                      <FormControl>
                        <Input
                          variant="underline"
                          type="number"
                          min="1"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-danger" />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </FormSection>

          <FormSection eyebrow="04" title="Amenities">
            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES.map((amenity) => {
                        const active = field.value.includes(amenity.value);
                        return (
                          <button
                            key={amenity.value}
                            type="button"
                            onClick={() => {
                              field.onChange(
                                active
                                  ? field.value.filter((v) => v !== amenity.value)
                                  : [...field.value, amenity.value],
                              );
                            }}
                            className={`eyebrow rounded-full px-4 py-2 border transition-colors ${
                              active
                                ? "bg-ink text-cream border-ink"
                                : "bg-transparent text-ink border-ink/15 hover:border-ink"
                            }`}
                          >
                            {amenity.label}
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-danger" />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection eyebrow="05" title="Photographs" hint="JPG or PNG, up to 5MB each. Five or more is ideal.">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group aspect-[4/5] rounded-sm overflow-hidden bg-bone">
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-cream/95 hover:bg-cream flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5 text-ink" />
                  </button>
                </div>
              ))}

              <label className="flex flex-col items-center justify-center aspect-[4/5] border border-dashed border-ink/20 rounded-sm cursor-pointer hover:border-ink hover:bg-bone/50 transition-colors text-ink2 hover:text-ink">
                <Upload className="h-6 w-6 mb-3" />
                <span className="eyebrow text-ink">Add photo</span>
                <span className="text-xs text-ink3 mt-1">or drop here</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </FormSection>

          <section className="container-page border-t border-linen py-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-sm text-ink3 max-w-md">
              We'll review your listing within a day. You can edit it any time after.
            </p>
            <Button type="submit" size="lg" disabled={loading} className="md:min-w-[200px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing…
                </>
              ) : (
                "Publish listing"
              )}
            </Button>
          </section>
        </form>
      </Form>
    </div>
  );
}

function FormSection({
  eyebrow,
  title,
  hint,
  children,
}: {
  eyebrow: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container-page border-t border-linen py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        <div className="md:col-span-3">
          <p className="eyebrow text-ink2 mb-2">{eyebrow}</p>
          <h2 className="font-display text-2xl text-ink leading-tight">{title}</h2>
          {hint && <p className="text-xs text-ink3 mt-3 leading-relaxed">{hint}</p>}
        </div>
        <div className="md:col-span-9 space-y-8">{children}</div>
      </div>
    </section>
  );
}

export default CreateListing;
