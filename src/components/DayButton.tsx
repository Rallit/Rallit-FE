import type { ComponentProps } from "react";

type DayButtonProps = Omit<
  ComponentProps<"button">,
  "children" | "type" | "aria-pressed" | "aria-current"
> & {
  day: number;
  weekday: string;
  today?: boolean;
  selected?: boolean;
  hasEvent?: boolean;
};

export function DayButton({
  day,
  weekday,
  today = false,
  selected = false,
  hasEvent = false,
  className,
  ...props
}: DayButtonProps) {
  const dayStyle =
    selected && !today
      ? "typography-label-l-bold"
      : "typography-label-l-medium";
  const captionColor = selected
    ? "text-(color:--fg-neutral-inverse)"
    : today
      ? "text-(color:--fg-accent-default)"
      : "text-(color:--fg-neutral-tertiary)";

  return (
    <button
      {...props}
      type="button"
      aria-pressed={selected}
      aria-current={today ? "date" : undefined}
      className={[
        "relative box-border flex h-15 w-12 shrink-0 cursor-pointer appearance-none flex-col items-center justify-center rounded-(--radius-medium) border-0 px-0 py-(--spacing-padding-small) disabled:cursor-default",
        selected
          ? "bg-(--bg-secondary-default) text-(color:--fg-neutral-inverse)"
          : "bg-(--bg-neutral-default) text-(color:--fg-neutral-secondary)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={dayStyle}>{day}</span>
      <span className={`typography-caption-r-medium ${captionColor}`}>
        {today ? "오늘" : weekday}
      </span>
      {hasEvent && (
        <>
          <span
            aria-hidden="true"
            className={`absolute top-2 right-2 size-1.5 rounded-(--radius-full) ${selected ? "bg-(--fg-neutral-inverse)" : "bg-(--red-500)"}`}
          />
          <span className="sr-only">일정 있음</span>
        </>
      )}
    </button>
  );
}
