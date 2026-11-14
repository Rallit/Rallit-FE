import type { ComponentProps } from "react";

type IconButtonSize = "default" | "small";

type IconButtonProps = Omit<
  ComponentProps<"button">,
  "children" | "aria-label"
> & {
  icon: string;
  iconClassName?: string;
  size?: IconButtonSize;
  "aria-label": string;
};

const iconBoxSize: Record<IconButtonSize, string> = {
  default: "size-6",
  small: "size-5",
};

export function IconButton({
  icon,
  iconClassName,
  size = "default",
  type = "button",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[
        "group grid size-11 shrink-0 cursor-pointer appearance-none place-items-center border-0 bg-transparent p-0 disabled:cursor-default",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={`grid place-items-center rounded-(--radius-small) group-active:bg-(--bg-state-pressed) group-disabled:bg-transparent ${iconBoxSize[size]}`}
      >
        <img
          src={icon}
          alt=""
          className={["block", iconClassName].filter(Boolean).join(" ")}
        />
      </span>
    </button>
  );
}
