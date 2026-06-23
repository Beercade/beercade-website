import { cn } from "@/lib/utils/cn";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>;

export function Container({
  children,
  className,
  as: Tag = "div",
  ...rest
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-layout px-[var(--grid-gutter-mobile)] md:px-[var(--grid-gutter)]",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
