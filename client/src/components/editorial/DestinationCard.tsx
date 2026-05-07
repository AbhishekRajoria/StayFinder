import { Link } from "react-router-dom";

interface DestinationCardProps {
  name: string;
  region: string;
  image: string;
  count?: number;
  href?: string;
  /** Vary layout — `tall` is 4:5, `wide` is 16:10 */
  ratio?: "tall" | "wide" | "square";
}

const ratioMap: Record<NonNullable<DestinationCardProps["ratio"]>, string> = {
  tall: "aspect-[4/5]",
  wide: "aspect-[16/10]",
  square: "aspect-square",
};

/**
 * Full-bleed image card with overlay text. Hover scales image 1.05.
 */
export function DestinationCard({
  name,
  region,
  image,
  count,
  href,
  ratio = "tall",
}: DestinationCardProps) {
  const Wrapper = href ? Link : "div";
  return (
    <Wrapper
      // @ts-expect-error react-router Link `to` typing — when href present
      to={href}
      className={`group relative overflow-hidden rounded-sm block ${ratioMap[ratio]}`}
    >
      <img
        src={image}
        alt={name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
        <p className="eyebrow text-cream/80">{region}</p>
        <h3 className="font-display text-cream text-2xl md:text-3xl mt-2">
          {name}
        </h3>
        {typeof count === "number" && (
          <p className="text-cream/80 text-sm mt-2">{count} stays</p>
        )}
      </div>
    </Wrapper>
  );
}
