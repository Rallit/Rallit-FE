import backIcon from "../../../assets/icons/back.svg";
import infoIcon from "../../../assets/icons/info.svg";
import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { IconButton } from "@/components/IconButton";

const levels = [
  {
    value: "1.0",
    description:
      "테니스를 처음 시작한 단계로, 라켓 잡는 법과 기본 자세를 배우며 공을 맞히는 연습을 해요.",
  },
  {
    value: "1.5",
    description:
      "기본적인 포핸드와 백핸드를 배우고 있지만, 공을 정확히 맞히거나 랠리를 이어가기 어려워요.",
  },
  {
    value: "2.0",
    description:
      "기본 스트로크로 공을 넘길 수 있지만, 방향 조절이 어렵고 서브와 발리 성공률이 낮아요.",
  },
  {
    value: "2.5",
    description:
      "느린 공으로 랠리를 이어가고 기본 서브와 발리가 가능하지만, 방향과 깊이 조절은 어려워요.",
  },
  {
    value: "3.0",
    description:
      "안정적인 랠리와 기본 발리, 세컨드 서브가 가능하지만 빠른 공이나 공격적인 샷에는 약해요.",
  },
  {
    value: "3.5",
    description:
      "스핀과 방향 조절이 가능하고, 공격적인 스트로크와 발리, 스핀 서브를 구사할 수 있어요.",
  },
  {
    value: "4.0+",
    description:
      "강한 공에도 안정적으로 대응하며, 정교한 코스 조절과 다양한 샷으로 경기를 주도할 수 있어요.",
  },
] as const;

export type NtrpLevel = (typeof levels)[number]["value"];

type NtrpPickerProps = {
  value: NtrpLevel;
  onChange: (value: NtrpLevel) => void;
};

const swipeThreshold = 24;
const directionThreshold = 8;
const wheelThreshold = 40;
const wheelStepInterval = 180;
const sideSlotWidth = 59;
const levelSpacing = 95;

export function NtrpPicker({ value, onChange }: NtrpPickerProps) {
  const labelId = useId();
  const [dragOffset, setDragOffset] = useState(0);
  const swipeStart = useRef<{
    id: number;
    x: number;
    y: number;
    horizontal: boolean;
  } | null>(null);
  const pickerRow = useRef<HTMLDivElement>(null);
  const wheelInput = useRef({
    distance: 0,
    lastEvent: -Infinity,
    lastStep: -Infinity,
  });
  const numberTrack = useRef<HTMLDivElement>(null);
  const index = levels.findIndex((level) => level.value === value);
  const previous = levels[index - 1];
  const next = levels[index + 1];

  const handleWheel = useEffectEvent((event: WheelEvent) => {
    if (event.ctrlKey || event.defaultPrevented || swipeStart.current) return;

    const { deltaMode, deltaX, deltaY, timeStamp } = event;
    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    if (!delta) return;

    const level = delta > 0 ? next : previous;
    const input = wheelInput.current;
    if (!level) {
      input.distance = 0;
      return;
    }

    event.preventDefault();
    if (
      timeStamp - input.lastEvent > wheelStepInterval ||
      Math.sign(input.distance) !== Math.sign(delta)
    ) {
      input.distance = 0;
    }
    input.lastEvent = timeStamp;
    if (timeStamp - input.lastStep < wheelStepInterval) return;

    input.distance +=
      deltaMode === WheelEvent.DOM_DELTA_PIXEL
        ? delta
        : Math.sign(delta) * wheelThreshold;
    if (Math.abs(input.distance) < wheelThreshold) return;

    input.distance = 0;
    input.lastStep = timeStamp;
    onChange(level.value);
  });

  useEffect(() => {
    const row = pickerRow.current;
    if (!row) return;

    const listener = (event: WheelEvent) => handleWheel(event);
    row.addEventListener("wheel", listener, { passive: false });
    return () => row.removeEventListener("wheel", listener);
  }, []);

  function startSwipe(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;

    swipeStart.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      horizontal: false,
    };
  }

  function moveSwipe(event: PointerEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    if (!start || start.id !== event.pointerId) return;

    const distanceX = event.clientX - start.x;
    const distanceY = event.clientY - start.y;
    if (!start.horizontal) {
      if (
        Math.abs(distanceX) < directionThreshold ||
        Math.abs(distanceX) <= Math.abs(distanceY)
      )
        return;
      start.horizontal = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const adjacentLevel = distanceX < 0 ? next : previous;
    const trackWidth = numberTrack.current?.clientWidth ?? 0;
    const slotWidth = Math.min(levelSpacing, (trackWidth - sideSlotWidth) / 2);
    const maxOffset = adjacentLevel ? Math.max(0, slotWidth) : 12;
    setDragOffset(
      Math.sign(distanceX) * Math.min(Math.abs(distanceX), maxOffset),
    );
  }

  function finishSwipe(event: PointerEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    if (!start || start.id !== event.pointerId) return;

    resetSwipe(event);
    const distanceX = event.clientX - start.x;
    if (!start.horizontal || Math.abs(distanceX) < swipeThreshold) return;

    const level = distanceX < 0 ? next : previous;
    if (level) onChange(level.value);
  }

  function resetSwipe(event: PointerEvent<HTMLDivElement>) {
    if (swipeStart.current?.id !== event.pointerId) return;
    swipeStart.current = null;
    setDragOffset(0);
  }

  return (
    <section aria-labelledby={labelId}>
      <div className="relative">
        <h2
          id={labelId}
          className="typography-label-r-medium m-0 text-(color:--fg-neutral-secondary)"
        >
          NTRP
        </h2>
        <img
          src={infoIcon}
          alt=""
          className="absolute top-1/2 right-0 block -translate-y-1/2"
        />
      </div>

      <div
        ref={pickerRow}
        onPointerDown={startSwipe}
        onPointerMove={moveSwipe}
        onPointerUp={finishSwipe}
        onPointerCancel={resetSwipe}
        onLostPointerCapture={(event) => {
          if (event.target === event.currentTarget) resetSwipe(event);
        }}
        onPointerLeave={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId))
            resetSwipe(event);
        }}
        className="-mx-(--spacing-padding-large) mt-(--spacing-gap-medium) grid touch-pan-y touch-pinch-zoom grid-cols-[44px_minmax(0,1fr)_44px] items-center px-[6px] py-(--spacing-padding-small) select-none"
      >
        <IconButton
          aria-label="이전 NTRP"
          icon={backIcon}
          disabled={!previous}
          className="disabled:opacity-30"
          onClick={() => previous && onChange(previous.value)}
        />
        <div
          ref={numberTrack}
          className="relative mx-auto h-14 w-full max-w-[249px] overflow-hidden text-center tabular-nums italic [container-type:inline-size]"
        >
          <output aria-live="polite" className="sr-only">
            {value}
          </output>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 mask-[linear-gradient(to_right,transparent,black_30px,black_calc(100%_-_30px),transparent)]"
          >
            {levels.map((level, position) => {
              const offset = position - index;
              const active = offset === 0;
              return (
                <span
                  key={level.value}
                  style={{
                    left: `calc(50% + min(${levelSpacing}px, (100% - ${sideSlotWidth}px) / 2) * ${offset} + ${dragOffset}px)`,
                  }}
                  className={[
                    "absolute top-1/2 -translate-1/2 leading-none font-semibold tracking-tight whitespace-nowrap",
                    dragOffset === 0 &&
                      "motion-safe:transition-[left,color,font-size,opacity] motion-safe:duration-200 motion-safe:ease-out",
                    Math.abs(offset) > 1 && "opacity-0",
                    active
                      ? "text-[min(64px,28cqw)] text-(color:--fg-accent-default)"
                      : "text-[min(40px,17cqw)] text-(color:--bg-neutral-weak)",
                    level.value === "4.0+" && "scale-x-[0.72]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {level.value}
                </span>
              );
            })}
          </div>
        </div>
        <IconButton
          aria-label="다음 NTRP"
          icon={backIcon}
          iconClassName="-scale-x-100"
          disabled={!next}
          className="disabled:opacity-30"
          onClick={() => next && onChange(next.value)}
        />
      </div>
      <p className="typography-body-regular m-0 mt-(--spacing-gap-medium) rounded-(--radius-small) bg-(--bg-neutral-weak) px-(--spacing-padding-small) py-(--spacing-padding-medium) text-center text-(color:--fg-neutral-tertiary)">
        {levels[index].description}
      </p>
    </section>
  );
}
