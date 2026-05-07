import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <div className="bg-cream min-h-[80vh] flex items-center">
      <div className="container-page text-center py-22">
        <p className="font-display text-[clamp(96px,18vw,200px)] text-ink leading-none tracking-[-0.04em]">
          404
        </p>
        <p className="font-display italic text-2xl md:text-3xl text-ink2 mt-6">
          We couldn't find that page.
        </p>
        <p className="text-ink3 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
          The link may be old, or the home you're looking for has flown the nest.
        </p>
        <Link to="/" className="editorial-link mt-10 inline-block text-xs">
          ← Back to the collection
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
