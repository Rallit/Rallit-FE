import { useRef, useState, type PointerEvent } from "react";

export type RangeSliderValue = readonly [minimum: number, maximum: number];

type RangeSliderProps = {
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  formatValue: (value: number) => string;
  value: RangeSliderValue;
  onChange: (value: RangeSliderValue) => void;
};

type Thumb = 0 | 1;
type Drag = { pointerId: number; thumb: Thumb | null };

export function RangeSlider({
  min,
  max,
  step,
  minLabel,
  maxLabel,
  formatValue,
  value: [minimum, maximum],
  onChange,
}: RangeSliderProps) {
  const [activeThumb, setActiveThumb] = useState<Thumb | null>(null);
  const drag = useRef<Drag | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const stepCount = Math.round((max - min) / step);
  const ticks = Array.from(
    { length: stepCount + 1 },
    (_, index) => min + index * step,
  );
  const insetPercent = 50 / ticks.length;
  const percent = (value: number) => ((value - min) / (max - min)) * 100;

  function changeValue(thumb: Thumb, value: number) {
    if (thumb === 0) {
      const next = Math.min(value, maximum);
      if (next !== minimum) onChange([next, maximum]);
    } else {
      const next = Math.max(value, minimum);
      if (next !== maximum) onChange([minimum, next]);
    }
  }

  function pointerValue(event: PointerEvent<HTMLDivElement>) {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const inset = (width * insetPercent) / 100;
    const fraction = (event.clientX - left - inset) / (width - 2 * inset);
    const index = Math.max(
      0,
      Math.min(stepCount, Math.round(fraction * stepCount)),
    );
    return ticks[index];
  }

  function activateThumb(current: Drag, thumb: Thumb) {
    current.thumb = thumb;
    setActiveThumb(thumb);
    inputs.current[thumb]?.focus({ preventScroll: true });
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const current: Drag = { pointerId: event.pointerId, thumb: null };
    drag.current = current;
    updateDrag(event);
  }

  function updateDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (current?.pointerId !== event.pointerId) return;

    const next = pointerValue(event);
    if (current.thumb === null) {
      if (minimum === maximum) {
        if (next === minimum) return;
        activateThumb(current, next < minimum ? 0 : 1);
      } else {
        activateThumb(current, next - minimum <= maximum - next ? 0 : 1);
      }
    }

    if (current.thumb !== null) changeValue(current.thumb, next);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    setActiveThumb(null);
  }

  const thumbs = [
    { index: 0, label: minLabel, value: minimum, min, max: maximum },
    { index: 1, label: maxLabel, value: maximum, min: minimum, max },
  ] as const;

  return (
    <div className="grid gap-(--spacing-gap-small)">
      <div
        className="relative h-9 touch-pan-y cursor-pointer select-none"
        onPointerDown={startDrag}
        onPointerMove={updateDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        <div
          className="pointer-events-none absolute inset-y-0"
          style={{ insetInline: `${insetPercent}%` }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-(--radius-small) bg-(--border-neutral-default)"
          >
            <div
              className="absolute inset-y-0 rounded-[inherit] bg-(--bg-secondary-default)"
              style={{
                left: `${percent(minimum)}%`,
                right: `${100 - percent(maximum)}%`,
              }}
            />
          </div>
          {thumbs.map((thumb) => {
            const active = activeThumb === thumb.index;
            return (
              <div
                key={thumb.index}
                className={`absolute top-1/2 grid size-11 -translate-1/2 place-items-center focus-within:z-1 ${active ? "z-2" : ""}`}
                style={{ left: `${percent(thumb.value)}%` }}
              >
                <input
                  ref={(element) => {
                    inputs.current[thumb.index] = element;
                  }}
                  type="range"
                  className="peer sr-only"
                  aria-label={thumb.label}
                  aria-valuetext={formatValue(thumb.value)}
                  min={thumb.min}
                  max={thumb.max}
                  step={step}
                  value={thumb.value}
                  onChange={(event) =>
                    changeValue(thumb.index, event.currentTarget.valueAsNumber)
                  }
                />
                <span
                  aria-hidden="true"
                  className={`box-border rounded-full border-solid border-(--bg-secondary-default) bg-(--bg-neutral-default) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--fg-accent-default) ${active ? "size-7 border-[3px]" : "size-5 border-2"}`}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="typography-label-r-medium flex h-[30px] items-center text-center text-(color:--fg-neutral-tertiary)"
      >
        {ticks.map((tick) => (
          <span key={tick} className="min-w-0 flex-1">
            {formatValue(tick)}
          </span>
        ))}
      </div>
    </div>
  );
}
