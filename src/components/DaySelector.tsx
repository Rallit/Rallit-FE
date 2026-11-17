import { useId, useRef, type PointerEvent } from "react";
import { DayButton } from "./DayButton";

type DayOption = {
  id: string;
  day: number;
  weekday: string;
  accessibleLabel: string;
  today?: boolean;
  hasEvent?: boolean;
  disabled?: boolean;
};

type DaySelectorProps = {
  monthLabel: string;
  className?: string;
  days: readonly DayOption[];
  selectedId?: string;
  selectedIds?: readonly string[];
  onSelect: (id: string) => void;
};

export function DaySelector({
  monthLabel,
  className,
  days,
  selectedId,
  selectedIds,
  onSelect,
}: DaySelectorProps) {
  const monthId = useId();
  const mouseDrag = useRef<{
    pointerId: number;
    startX: number;
    startScrollLeft: number;
  } | null>(null);
  const skipPointerClick = useRef(false);

  function startMouseDrag(event: PointerEvent<HTMLDivElement>) {
    skipPointerClick.current = false;
    const list = event.currentTarget;
    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      list.scrollWidth <= list.clientWidth
    )
      return;

    mouseDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: list.scrollLeft,
    };
  }

  function moveMouseDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = mouseDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const list = event.currentTarget;
    const distance = event.clientX - drag.startX;
    if (!skipPointerClick.current) {
      if (Math.abs(distance) < 5) return;
      list.setPointerCapture(event.pointerId);
      skipPointerClick.current = true;
    }
    list.scrollLeft = drag.startScrollLeft - distance;
  }

  function finishMouseDrag(event: PointerEvent<HTMLDivElement>) {
    if (mouseDrag.current?.pointerId === event.pointerId) {
      mouseDrag.current = null;
    }
  }

  return (
    <div
      role="group"
      aria-labelledby={monthId}
      className={[
        "box-border flex w-full min-w-0 flex-col gap-(--spacing-gap-medium) rounded-(--radius-large) border border-solid border-(--border-neutral-weak) bg-(--bg-neutral-default) p-(--spacing-padding-medium)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p
        id={monthId}
        className="typography-label-r-medium m-0 px-(--spacing-padding-small) text-(color:--fg-neutral-secondary)"
      >
        {monthLabel}
      </p>
      <div
        className="w-full overflow-x-auto scrollbar-none select-none"
        onPointerDown={startMouseDrag}
        onPointerMove={moveMouseDrag}
        onPointerUp={finishMouseDrag}
        onPointerCancel={finishMouseDrag}
        onLostPointerCapture={finishMouseDrag}
        onPointerLeave={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId))
            finishMouseDrag(event);
        }}
        onClickCapture={(event) => {
          if (skipPointerClick.current && event.detail > 0)
            event.stopPropagation();
          skipPointerClick.current = false;
        }}
      >
        <div className="mx-auto flex w-max gap-(--spacing-gap-micro)">
          {days.map(({ id, accessibleLabel, ...dayProps }) => (
            <DayButton
              {...dayProps}
              key={id}
              selected={selectedIds?.includes(id) ?? selectedId === id}
              aria-label={
                dayProps.hasEvent
                  ? `${accessibleLabel}, 일정 있음`
                  : accessibleLabel
              }
              onClick={() => onSelect(id)}
              className="focus-visible:outline-offset-[-2px]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
