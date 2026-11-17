import type { PropsWithChildren } from "react";

const styles = {
  brand:
    "rounded-(--radius-small) bg-(--bg-primary-inverse) text-(color:--fg-brand-strong)",
  blue: "rounded-(--radius-small) bg-(--bg-secondary-inverse) text-(color:--fg-accent-default)",
  "blue-inverse":
    "rounded-(--radius-full) bg-(--bg-secondary-default) text-(color:--fg-neutral-inverse)",
  neutral:
    "rounded-(--radius-small) bg-(--bg-neutral-weak) text-(color:--fg-brand-strong)",
};

type BadgeProps = PropsWithChildren<{
  variant?: keyof typeof styles;
  fitContent?: boolean;
}>;

export function Badge({
  children,
  variant = "brand",
  fitContent = false,
}: BadgeProps) {
  return (
    <span
      className={`typography-caption-r-bold box-border inline-flex w-fit shrink-0 items-center justify-center px-(--spacing-padding-small) py-(--spacing-padding-micro) whitespace-nowrap text-center ${fitContent ? "" : "h-(--unit-24)"} ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
