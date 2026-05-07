import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MoreHorizontal, Plus, Eye, Pencil, Trash2 } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import { getMyListings, deleteListing } from "@/api/listingApi";
import type { Listing } from "@/types/listing";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EditListingModal } from "@/components/listing/EditListingModal";
import { ScrollReveal, ListingCardSkeleton } from "@/components/editorial";

export default function MyListings() {
  const { toast } = useToast();
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["myListings"],
    queryFn: getMyListings,
  });

  const listings = (data?.data?.listings ?? []) as Listing[];

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await deleteListing(id);
      toast({ title: "Listing removed", description: "It's gone from the collection." });
      refetch();
    } catch {
      toast({
        title: "Couldn't delete",
        description: "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <section className="container-page pt-12 md:pt-20 pb-12">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="eyebrow text-ink2 mb-4">Hosting</p>
            <h1 className="font-display text-display text-ink">Your listings.</h1>
          </div>
          <Button asChild>
            <Link to="/listings/create" className="gap-2">
              <Plus className="h-4 w-4" /> New listing
            </Link>
          </Button>
        </div>
      </section>

      <section className="container-page pb-22">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {[0, 1, 2].map((i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-bone rounded-sm p-12 max-w-lg">
            <p className="eyebrow text-ink2 mb-3">No listings yet</p>
            <p className="font-display text-2xl text-ink leading-snug">
              Open your first home.
            </p>
            <p className="text-ink2 text-sm mt-3 leading-relaxed">
              Walk us through the basics, upload a few photographs, set a nightly rate.
              We'll handle the rest.
            </p>
            <Button asChild className="mt-7">
              <Link to="/listings/create">List your home</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14">
            {listings.map((listing) => (
              <ScrollReveal key={listing._id}>
                <article className="group">
                  <Link
                    to={`/listings/${listing._id}`}
                    className="block aspect-[4/5] relative overflow-hidden rounded-sm bg-bone"
                  >
                    {listing.images?.[0] && (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    )}
                    <span className="absolute top-3 left-3 eyebrow bg-cream/90 text-ink rounded-full px-3 py-1 backdrop-blur">
                      Active
                    </span>
                  </Link>

                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg text-ink leading-snug truncate">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-ink3 mt-1 truncate">{listing.location}</p>
                      <p className="font-display text-base text-ink mt-3">
                        ${listing.price}
                        <span className="text-ink3 text-sm font-sans"> / night</span>
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="h-9 w-9 rounded-full border border-ink/15 hover:border-ink flex items-center justify-center transition-colors"
                          aria-label="Listing actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-cream border-linen w-48">
                        <DropdownMenuItem asChild>
                          <Link to={`/listings/${listing._id}`} className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditingListing(listing)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-linen" />
                        <DropdownMenuItem
                          onClick={() => {
                            setListingToDelete(listing);
                            setDeleteDialogOpen(true);
                          }}
                          className="cursor-pointer text-danger"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-cream border-linen">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl text-ink">
              Remove this listing?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-ink2 leading-relaxed">
              This action can't be undone. Future bookings will be cancelled and the
              listing will be removed from the collection immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-linen hover:bg-linen rounded-full">
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => listingToDelete && handleDelete(listingToDelete._id)}
              disabled={isDeleting}
              className="bg-danger text-cream hover:bg-danger/90 rounded-full"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing…
                </>
              ) : (
                "Yes, remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingListing && (
        <EditListingModal
          listing={editingListing as any}
          isOpen={!!editingListing}
          onClose={() => setEditingListing(null)}
          onSuccess={() => {
            refetch();
            setEditingListing(null);
          }}
        />
      )}
    </div>
  );
}
