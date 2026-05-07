interface StatBlockProps {
  value: string;
  label: string;
  className?: string;
}

/**
 * Editorial stat: large Fraunces value over eyebrow label.
 * Usage in 3-col strips on Home and Dashboard.
 */
export function StatBlock({ value, label, className }: StatBlockProps) {
  return (
    <div className={`text-center ${className ?? ""}`}>
      <p className="font-display text-display-lg text-ink leading-none">
        {value}
      </p>
      <p className="eyebrow mt-4 text-ink2">{label}</p>
    </div>
  );
}
