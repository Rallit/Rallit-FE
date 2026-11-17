import { useState } from "react";
import forwardIcon from "../../assets/icons/forward.svg";
import { IconButton } from "./IconButton";

const weekdays = ["월", "화", "수", "목", "금", "토", "일"];

type CalendarProps = {
  value: string | null;
  onChange: (date: string) => void;
  min: string;
  max: string;
  className?: string;
};

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getArrowColor(enabled: boolean) {
  return enabled ? "var(--fg-neutral-secondary)" : "var(--fg-neutral-subtle)";
}

export function Calendar({
  value,
  onChange,
  min,
  max,
  className,
}: CalendarProps) {
  const initial = value ?? min;
  const [view, setView] = useState({
    year: Number(initial.slice(0, 4)),
    month: Number(initial.slice(5, 7)) - 1,
  });

  const firstWeekday = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const canPrev = toDateString(view.year, view.month, 1) > min;
  const canNext = toDateString(view.year, view.month, daysInMonth) < max;
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  function move(offset: number) {
    setView(({ year, month }) => {
      const next = new Date(year, month + offset, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  return (
    <div
      className={[
        "flex flex-col gap-(--spacing-gap-large) px-(--spacing-padding-extra-large) py-(--spacing-padding-large)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between">
        <IconButton
          size="small"
          icon={forwardIcon}
          iconClassName="rotate-180"
          iconColor={getArrowColor(canPrev)}
          aria-label="이전 달"
          disabled={!canPrev}
          onClick={() => move(-1)}
          className="-m-3"
        />
        <p
          aria-live="polite"
          className="typography-label-l-medium m-0 text-(color:--fg-neutral-secondary)"
        >
          {view.year}년 {view.month + 1}월
        </p>
        <IconButton
          size="small"
          icon={forwardIcon}
          iconColor={getArrowColor(canNext)}
          aria-label="다음 달"
          disabled={!canNext}
          onClick={() => move(1)}
          className="-m-3"
        />
      </div>

      <div className="grid grid-cols-7 justify-items-center">
        {weekdays.map((weekday) => (
          <span
            key={weekday}
            className="typography-caption-r-medium flex h-5 w-[30px] items-center justify-center text-(color:--fg-neutral-subtle)"
          >
            {weekday}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 justify-items-center gap-y-(--spacing-gap-medium)">
        {cells.map((day, index) => {
          if (day === null)
            return (
              <span
                key={`blank-${index}`}
                aria-hidden="true"
                className="size-8"
              />
            );

          const date = toDateString(view.year, view.month, day);
          const selected = date === value;
          return (
            <button
              key={date}
              type="button"
              disabled={date < min || date > max}
              aria-pressed={selected}
              aria-label={`${view.month + 1}월 ${day}일`}
              onClick={() => onChange(date)}
              className={`typography-label-l-medium grid size-8 cursor-pointer appearance-none place-items-center rounded-(--radius-full) border-0 p-0 disabled:cursor-default ${selected ? "bg-(--bg-secondary-default) text-(color:--fg-neutral-inverse)" : "bg-transparent text-(color:--fg-neutral-secondary) disabled:text-(color:--fg-neutral-subtle)"}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
