import type { ComponentProps } from "react";

type TextButtonProps = Omit<ComponentProps<"button">, "children"> & {
  label: string;
};

export function TextButton({
  label,
  type = "button",
  className,
  ...props
}: TextButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[
        "typography-label-r-medium box-border inline-flex h-11 w-fit min-w-11 cursor-pointer appearance-none items-center justify-center border-0 bg-transparent p-0 text-center text-(color:--fg-neutral-tertiary) whitespace-nowrap underline decoration-solid decoration-from-font [text-underline-position:from-font] disabled:cursor-default",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </button>
  );
}
