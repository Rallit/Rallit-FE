import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

const wheelRowHeight = 44;

type NumberWheelProps = {
  label: string;
  unit: string;
  first: number;
  last: number;
  value: number;
  onChange: (value: number) => void;
};

export function NumberWheel({
  label,
  unit,
  first,
  last,
  value,
  onChange,
}: NumberWheelProps) {
  const id = useId();
  const wheel = useRef<HTMLDivElement>(null);
  const mouseDrag = useRef<{
    pointerId: number;
    startY: number;
    startScrollTop: number;
    dragging: boolean;
  } | null>(null);
  const skipPointerClick = useRef(false);
  const [initialOffset] = useState(() => (value - first) * wheelRowHeight);

  useLayoutEffect(() => {
    const list = wheel.current;
    if (!list) return;

    const frame = requestAnimationFrame(() => {
      list.scrollTop = initialOffset;
    });

    return () => cancelAnimationFrame(frame);
  }, [initialOffset]);

  function select(option: number) {
    const selected = Math.min(last, Math.max(first, option));
    if (wheel.current)
      wheel.current.scrollTop = (selected - first) * wheelRowHeight;
    onChange(selected);
  }

  function startMouseDrag(event: PointerEvent<HTMLDivElement>) {
    skipPointerClick.current = false;
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    mouseDrag.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollTop: event.currentTarget.scrollTop,
      dragging: false,
    };
  }

  function moveMouseDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = mouseDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const distance = event.clientY - drag.startY;
    const list = event.currentTarget;
    if (!drag.dragging) {
      if (Math.abs(distance) < 5) return;
      drag.dragging = true;
      skipPointerClick.current = true;
      list.setPointerCapture(event.pointerId);
      list.style.scrollSnapType = "none";
    }

    list.scrollTop = drag.startScrollTop - distance;
  }

  function finishMouseDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = mouseDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    mouseDrag.current = null;
    if (!drag.dragging) return;

    const list = event.currentTarget;
    select(first + Math.round(list.scrollTop / wheelRowHeight));
    list.style.scrollSnapType = "";
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const option = {
      ArrowUp: value - 1,
      ArrowDown: value + 1,
      Home: first,
      End: last,
    }[event.key];
    if (option === undefined) return;
    event.preventDefault();
    select(option);
  }

  return (
    <div className="relative min-w-0 flex-1">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-11 -translate-y-1/2 rounded-(--radius-small) bg-(--bg-neutral-weak)"
      />
      <div
        ref={wheel}
        role="listbox"
        aria-label={label}
        aria-activedescendant={id + "-" + value}
        tabIndex={0}
        onKeyDown={handleKeyDown}
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
        onScroll={(event) => {
          if (mouseDrag.current?.dragging) return;
          const option =
            first + Math.round(event.currentTarget.scrollTop / wheelRowHeight);
          const selected = Math.min(last, Math.max(first, option));
          if (selected !== value) onChange(selected);
        }}
        className="relative box-border h-[220px] snap-y snap-mandatory overflow-y-auto overscroll-y-contain py-[88px] text-center select-none [scrollbar-width:none] cursor-grab active:cursor-grabbing focus-visible:rounded-(--radius-small) focus-visible:outline-2 focus-visible:outline-(--border-brand-focus)"
      >
        {Array.from({ length: last - first + 1 }, (_, index) => {
          const option = first + index;
          return (
            <div
              key={option}
              id={id + "-" + option}
              role="option"
              aria-selected={option === value}
              onClick={() => select(option)}
              className="typography-heading-bold grid h-11 snap-center place-items-center text-(color:--fg-neutral-subtle) aria-selected:text-(color:--fg-neutral-default)"
            >
              {option}
              {unit}
            </div>
          );
        })}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-(--radius-small) bg-linear-to-b from-(--bg-neutral-default) to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-(--radius-small) bg-linear-to-t from-(--bg-neutral-default) to-transparent"
      />
    </div>
  );
}
