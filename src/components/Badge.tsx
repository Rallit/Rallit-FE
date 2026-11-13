import type { PropsWithChildren } from "react";

const styles = {
  brand:
    "rounded-(--radius-small) bg-(--bg-primary-inverse) text-(color:--fg-brand-strong)",
  blue: "rounded-(--radius-small) bg-(--bg-secondary-inverse) text-(color:--fg-accent-default)",
  "blue-inverse":
    "rounded-(--radius-full) bg-(--bg-secondary-default) text-(color:--fg-neutral-inverse)",
};

type BadgeProps = PropsWithChildren<{ variant?: keyof typeof styles }>;

export function Badge({ children, variant = "brand" }: BadgeProps) {
  return (
    <span
      className={`typography-caption-r-bold box-border inline-flex h-(--unit-24) w-fit shrink-0 items-center justify-center px-(--spacing-padding-small) py-(--spacing-padding-micro) whitespace-nowrap text-center ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
