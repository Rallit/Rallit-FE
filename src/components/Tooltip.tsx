import type { ComponentProps } from "react";

type TooltipProps = Pick<ComponentProps<"div">, "children" | "id" | "ref">;

export function Tooltip({ children, id, ref }: TooltipProps) {
  return (
    <div
      id={id}
      ref={ref}
      role="tooltip"
      className="typography-caption-r-medium pointer-events-auto box-border w-max max-w-[min(320px,100%)] rounded-(--radius-medium) rounded-br-none bg-(--bg-neutral-weak) px-(--spacing-padding-large) py-(--spacing-padding-medium) text-center break-keep whitespace-pre-line text-(color:--fg-neutral-secondary)"
    >
      {children}
    </div>
  );
}
