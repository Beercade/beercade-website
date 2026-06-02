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
    <div className={cn("space-y-3", className)}>
      {kicker && <p className="t-kicker">{kicker}</p>}
      <Tag
        className={cn(
          // Archivo Black display for h1; Archivo Bold for section headings.
          Tag === "h1" ? "t-display" : "t-h2",
          "text-crema text-balance"
        )}
      >
        {children}
      </Tag>
    </div>
  );
}
