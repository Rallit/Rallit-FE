import type { ComponentProps } from "react";

type IconButtonProps = Omit<
  ComponentProps<"button">,
  "children" | "aria-label"
> & {
  icon: string;
  iconClassName?: string;
  "aria-label": string;
};

export function IconButton({
  icon,
  iconClassName,
  type = "button",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[
        "grid size-11 shrink-0 cursor-pointer appearance-none place-items-center border-0 bg-transparent p-0 disabled:cursor-default",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={icon}
        alt=""
        className={["block", iconClassName].filter(Boolean).join(" ")}
      />
    </button>
  );
}
