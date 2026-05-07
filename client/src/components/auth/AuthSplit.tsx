import { type ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthSplitProps {
  /** Hero image — full-height right column on desktop, top banner on mobile. */
  image: string;
  /** Optional credit overlay over image (small italics). */
  imageCaption?: string;
  children: ReactNode;
}

/**
 * Split-screen auth layout — 6/6 desktop, stacked mobile. Left is form, right is
 * full-height ambient travel image with a slow Ken Burns drift.
 */
export function AuthSplit({ image, imageCaption, children }: AuthSplitProps) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-cream">
      {/* LEFT — form */}
      <div className="flex flex-col px-6 md:px-12 lg:px-20 py-10 md:py-16 relative">
        <Link
          to="/"
          className="font-display italic text-2xl text-ink leading-none w-fit"
        >
          StayFinder
        </Link>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <p className="text-xs text-ink3">
          © {new Date().getFullYear()} StayFinder
        </p>
      </div>

      {/* RIGHT — image */}
      <div className="hidden md:block relative overflow-hidden bg-ink">
        <img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover animate-kenburns"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-ink/0 to-ink/0" />
        {imageCaption && (
          <p className="absolute bottom-8 left-8 right-8 eyebrow text-cream/80 italic font-display normal-case tracking-normal text-base">
            {imageCaption}
          </p>
        )}
      </div>
    </div>
  );
}
