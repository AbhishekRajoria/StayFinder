import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X, Upload } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import { getListing, updateListing } from "@/api/listingApi";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listingSchema } from "@/lib/validations/listing";
import { amenities, AmenityId } from "@/config/amenities";
import { ScrollReveal } from "@/components/editorial";

type FormValues = z.infer<typeof listingSchema>;

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      price: 0,
      guests: 1,
      bedrooms: 1,
      bathrooms: 1,
      propertyType: "house" as const,
      amenities: [] as AmenityId[],
      images: [],
    },
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await getListing(id!);
        const l = response.data.listing;
        form.reset({
          title: l.title,
          description: l.description,
          location: l.location,
          price: l.price,
          guests: l.guests,
          bedrooms: l.bedrooms,
          bathrooms: l.bathrooms,
          propertyType: l.propertyType as FormValues["propertyType"],
          amenities: l.amenities as AmenityId[],
          images: l.images,
        });
        setImages(l.images);
      } catch (error) {
        toast({
          title: "Couldn't load listing",
          description: "Try refreshing the page.",
          variant: "destructive",
        });
      }
    };
    fetchListing();
  }, [id, toast, form]);

  const handleRemoveImage = (url: string) => {
    setImagesToDelete((prev) => [...prev, url]);
    setImages((prev) => prev.filter((img) => img !== url));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("location", data.location);
      formData.append("price", data.price.toString());
      formData.append("guests", data.guests.toString());
      formData.append("bedrooms", data.bedrooms.toString());
      formData.append("bathrooms", data.bathrooms.toString());
      formData.append("propertyType", data.propertyType);
      data.amenities.forEach((a) => formData.append("amenities[]", a));
      imagesToDelete.forEach((img) => formData.append("imagesToDelete[]", img));
      newImages.forEach((file) => formData.append("images", file));

      await updateListing(id!, formData);
      toast({ title: "Listing updated." });
      navigate(`/listings/${id}`);
    } catch (error) {
      toast({
        title: "Couldn't save changes",
        description: "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <ScrollReveal className="container-page pt-12 md:pt-20 pb-10">
        <p className="eyebrow text-ink2 mb-4">Hosting</p>
        <h1 className="font-display text-display text-ink leading-tight">
          Edit listing.
        </h1>
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
                    <Input variant="underline" {...field} />
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
                    <Input variant="underline" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-danger" />
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection eyebrow="02" title="Pricing & capacity">
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
                    <FormLabel className="eyebrow text-ink2">Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-0 border-b border-linen rounded-none px-0 focus:ring-0 bg-transparent">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-cream border-linen">
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="cabin">Cabin</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="loft">Loft</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-danger" />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {(["guests", "bedrooms", "bathrooms"] as const).map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="eyebrow text-ink2">
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          variant="underline"
                          type="number"
                          min="1"
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

          <FormSection eyebrow="03" title="Amenities">
            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity) => {
                        const active = field.value?.includes(amenity.id);
                        return (
                          <button
                            key={amenity.id}
                            type="button"
                            onClick={() => {
                              const current = field.value || [];
                              field.onChange(
                                active
                                  ? current.filter((v) => v !== amenity.id)
                                  : [...current, amenity.id],
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

          <FormSection eyebrow="04" title="Photographs" hint="Hover an image to remove it. Add new ones below.">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={image} className="relative group aspect-[4/5] rounded-sm overflow-hidden bg-bone">
                  <img
                    src={image}
                    alt={`Listing image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image)}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-cream/95 hover:bg-cream flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5 text-ink" />
                  </button>
                </div>
              ))}
              {newImages.map((file, index) => (
                <div key={index} className="relative group aspect-[4/5] rounded-sm overflow-hidden bg-bone">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 eyebrow bg-cream/95 text-ink rounded-full px-2.5 py-1 backdrop-blur">
                    New
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-cream/95 hover:bg-cream flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove new image"
                  >
                    <X className="h-3.5 w-3.5 text-ink" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center aspect-[4/5] border border-dashed border-ink/20 rounded-sm cursor-pointer hover:border-ink hover:bg-bone/50 transition-colors text-ink2 hover:text-ink">
                <Upload className="h-6 w-6 mb-3" />
                <span className="eyebrow text-ink">Add photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </FormSection>

          <section className="container-page border-t border-linen py-12 flex flex-col md:flex-row md:items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate(`/listings/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting} className="md:min-w-[200px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
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
