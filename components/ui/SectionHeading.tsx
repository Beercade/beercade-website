import { cn } from "@/lib/utils/cn";

interface SectionHeadingProps {
  as?: "h1" | "h2" | "h3";
  children: React.ReactNode;
  className?: string;
  kicker?: string;
}

export function SectionHeading({
  as: Tag = "h2",
  children,
  className,
  kicker,
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {kicker && (
        <p className="font-accent text-xs uppercase tracking-widest text-high-score-orange">
          {kicker}
        </p>
      )}
      <Tag
        className={cn(
          // Archivo Black for page titles (h1); Archivo Bold for section headings (h2/h3)
          Tag === "h1" ? "font-display" : "font-heading",
          "text-3xl font-bold text-crema md:text-4xl"
        )}
      >
        {children}
      </Tag>
    </div>
  );
}
