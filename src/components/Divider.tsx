type DividerProps = { className?: string } & (
  | { orientation?: "horizontal"; variant?: "default" | "thick" }
  | { orientation: "vertical"; length?: 16 | 32; variant?: "default" }
);

export function Divider(props: DividerProps) {
  const size =
    props.orientation === "vertical"
      ? props.length === 16
        ? "h-(--unit-16) w-px"
        : "h-(--unit-32) w-px"
      : props.variant === "thick"
        ? "h-(--unit-4) w-full"
        : "h-px w-full";

  return (
    <span
      aria-hidden="true"
      className={[
        "block shrink-0 bg-(--border-neutral-default)",
        size,
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
