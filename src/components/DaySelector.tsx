import { useId } from "react";
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
  days: readonly DayOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

export function DaySelector({
  monthLabel,
  days,
  selectedId,
  onSelect,
}: DaySelectorProps) {
  const monthId = useId();

  return (
    <div
      role="group"
      aria-labelledby={monthId}
      className="box-border flex w-full min-w-0 flex-col gap-(--spacing-gap-medium) rounded-(--radius-large) border border-solid border-(--border-neutral-weak) bg-(--bg-neutral-default) py-(--spacing-padding-medium)"
    >
      <p
        id={monthId}
        className="typography-label-r-medium m-0 px-(--spacing-padding-medium) text-(color:--fg-neutral-secondary)"
      >
        {monthLabel}
      </p>
      <div className="w-full overflow-x-auto">
        <div className="mx-auto flex w-max">
          {days.map(({ id, accessibleLabel, ...dayProps }) => (
            <DayButton
              {...dayProps}
              key={id}
              selected={selectedId === id}
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
