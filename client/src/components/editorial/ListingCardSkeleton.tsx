/**
 * Cream-toned skeleton matching ListingCardEditorial layout. Uses slow opacity
 * pulse (animate-soft-pulse) instead of shimmer — feels more editorial.
 */
export function ListingCardSkeleton() {
  return (
    <div className="animate-soft-pulse">
      <div className="aspect-[4/5] rounded-sm bg-bone" />
      <div className="mt-5 space-y-3">
        <div className="h-3 w-20 bg-bone rounded-sm" />
        <div className="h-5 w-3/4 bg-bone rounded-sm" />
        <div className="h-3 w-1/2 bg-bone rounded-sm" />
        <div className="h-4 w-24 bg-bone rounded-sm" />
      </div>
    </div>
  );
}
