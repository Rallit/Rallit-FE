import type { ComponentProps } from "react";
import "./ActionButton.css";

type ActionButtonVariantProps =
  | { variant?: "primary" | "tertiary"; size?: "S" | "M" }
  | { variant: "secondary"; size?: "M" };

export type ActionButtonProps = ComponentProps<"button"> &
  ActionButtonVariantProps & { fullWidth?: boolean };

export function ActionButton({
  variant = "primary",
  size = variant === "secondary" ? "M" : "S",
  type = "button",
  fullWidth = false,
  className,
  ...props
}: ActionButtonProps) {
  const labelStyle =
    size === "S" ? "typography-label-r-medium" : "typography-label-l-medium";
  const classes = ["action-button", labelStyle, className].filter(Boolean);

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
