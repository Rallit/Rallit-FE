import type { ComponentProps } from "react";

type FilterChipProps = Omit<
  ComponentProps<"button">,
  "children" | "type" | "aria-pressed"
> & {
  label: string;
  selected?: boolean;
};

export function FilterChip({
  label,
  selected = false,
  className,
  ...props
}: FilterChipProps) {
  return (
    <button
      {...props}
      type="button"
      aria-pressed={selected}
      className={[
        "typography-label-r-medium box-border inline-flex h-9 w-fit shrink-0 cursor-pointer appearance-none items-center justify-center rounded-(--radius-full) border-0 px-(--spacing-padding-medium) py-(--spacing-padding-small) whitespace-nowrap disabled:cursor-default",
        selected
          ? "bg-(--bg-secondary-inverse) text-(color:--fg-accent-default)"
          : "bg-(--bg-neutral-weak) text-(color:--fg-neutral-secondary)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </button>
  );
}
