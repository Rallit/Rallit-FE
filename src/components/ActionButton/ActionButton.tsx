import type { ComponentProps } from "react";

type ActionButtonVariantProps =
  | { variant?: "primary" | "tertiary"; size?: "S" | "M" }
  | { variant: "secondary"; size?: "M" };

export type ActionButtonProps = ComponentProps<"button"> &
  ActionButtonVariantProps & { fullWidth?: boolean };

const baseStyles = [
  "action-button box-border inline-flex cursor-pointer appearance-none items-center justify-center border-0 text-center",
  "bg-[linear-gradient(var(--action-button-overlay),var(--action-button-overlay))] [--action-button-overlay:transparent]",
  "enabled:hover:[--action-button-overlay:var(--bg-state-hover)] enabled:active:[--action-button-overlay:var(--bg-state-pressed)]",
  "disabled:cursor-default disabled:bg-(--bg-state-disabled) disabled:text-(color:--fg-neutral-subtle)",
].join(" ");

const variantStyles = {
  primary: "bg-(--bg-primary-default) text-(color:--fg-neutral-default)",
  secondary: "bg-(--bg-primary-inverse) text-(color:--fg-brand-strong)",
  tertiary: "bg-(--bg-neutral-weak) text-(color:--fg-neutral-default)",
};

const sizeStyles = {
  S: "typography-label-r-medium h-[36px] min-w-[56px] rounded-(--radius-small) px-(--spacing-padding-large) py-(--spacing-padding-small)",
  M: "typography-label-l-medium h-[48px] min-w-[76px] rounded-(--radius-medium) px-(--spacing-padding-extra-large) py-(--spacing-padding-medium)",
};

export function ActionButton({
  variant = "primary",
  size = variant === "secondary" ? "M" : "S",
  type = "button",
  fullWidth = false,
  className,
  ...props
}: ActionButtonProps) {
  const classes = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? "w-full" : "w-fit",
    className,
  ].filter(Boolean);

  return (
    <button
      {...props}
      type={type}
      className={classes.join(" ")}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
    />
  );
}
