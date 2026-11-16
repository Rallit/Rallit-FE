import backIcon from "../../../assets/icons/back.svg";
import infoIcon from "../../../assets/icons/info.svg";
import ntrp10 from "../../../assets/images/ntrp/ntrp-1.0.svg";
import ntrp15 from "../../../assets/images/ntrp/ntrp-1.5.svg";
import ntrp20 from "../../../assets/images/ntrp/ntrp-2.0.svg";
import ntrp25 from "../../../assets/images/ntrp/ntrp-2.5.svg";
import ntrp30 from "../../../assets/images/ntrp/ntrp-3.0.svg";
import ntrp35 from "../../../assets/images/ntrp/ntrp-3.5.svg";
import ntrp40Plus from "../../../assets/images/ntrp/ntrp-4.0-plus.svg";
import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { OnboardingProfile } from "@/apis/onboarding.types";
import { IconButton } from "@/components/IconButton";
import { Tooltip } from "@/components/Tooltip";

const levels = [
  {
    value: "1.0",
    graphic: ntrp10,
    description:
      "테니스를 처음 시작한 단계로, \n라켓 잡는 법과 기본 자세를 배우며 공을 맞히는 연습을 해요.",
  },
  {
    value: "1.5",
    graphic: ntrp15,
    description:
      "기본적인 포핸드와 백핸드를 배우고 있지만, \n공을 정확히 맞히거나 랠리를 이어가기 어려워요.",
  },
  {
    value: "2.0",
    graphic: ntrp20,
    description:
      "기본 스트로크로 공을 넘길 수 있지만, \n방향 조절이 어렵고 서브와 발리 성공률이 낮아요.",
  },
  {
    value: "2.5",
    graphic: ntrp25,
    description:
      "느린 공으로 랠리를 이어가고 기본 서브와 발리가 가능하지만, \n방향과 깊이 조절은 어려워요.",
  },
  {
    value: "3.0",
    graphic: ntrp30,
    description:
      "안정적인 랠리와 기본 발리, 세컨드 서브가 가능하지만, \n빠른 공이나 공격적인 샷에는 약해요.",
  },
  {
    value: "3.5",
    graphic: ntrp35,
    description:
      "스핀과 방향 조절이 가능하고, \n공격적인 스트로크와 발리, 스핀 서브를 구사할 수 있어요.",
  },
  {
    value: "4.0+",
    graphic: ntrp40Plus,
    description:
      "강한 공에도 안정적으로 대응하며, \n정교한 코스 조절과 다양한 샷으로 경기를 주도할 수 있어요.",
  },
] as const;

type NtrpLevel = OnboardingProfile["ntrp"];

type NtrpPickerProps = {
  value: NtrpLevel;
  onChange: (value: NtrpLevel) => void;
};

const swipeThreshold = 24;
const directionThreshold = 8;
const wheelThreshold = 40;
const wheelStepInterval = 180;

export function NtrpPicker({ value, onChange }: NtrpPickerProps) {
  const labelId = useId();
  const tooltipId = useId();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipTrigger = useRef<HTMLButtonElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
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
  const numberFrames = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!tooltipOpen) return;

    function dismissOnOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        !tooltipTrigger.current?.contains(target) &&
        !tooltip.current?.contains(target)
      ) {
        setTooltipOpen(false);
      }
    }

    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setTooltipOpen(false);
    }

    document.addEventListener("pointerdown", dismissOnOutsidePointer, true);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener(
        "pointerdown",
        dismissOnOutsidePointer,
        true,
      );
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [tooltipOpen]);

  function startSwipe(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;

    swipeStart.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      horizontal: false,
    };
  }

  function moveSwipe(event: ReactPointerEvent<HTMLDivElement>) {
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

    const frames = numberFrames.current?.children;
    const active = frames?.[index] as HTMLElement | undefined;
    const adjacent = frames?.[index + (distanceX < 0 ? 1 : -1)] as
      HTMLElement | undefined;
    const maxOffset =
      active && adjacent
        ? Math.abs(adjacent.offsetLeft - active.offsetLeft)
        : 12;
    setDragOffset(
      Math.sign(distanceX) * Math.min(Math.abs(distanceX), maxOffset),
    );
  }

  function finishSwipe(event: ReactPointerEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    if (!start || start.id !== event.pointerId) return;

    resetSwipe(event);
    const distanceX = event.clientX - start.x;
    if (!start.horizontal || Math.abs(distanceX) < swipeThreshold) return;

    const level = distanceX < 0 ? next : previous;
    if (level) onChange(level.value);
  }

  function resetSwipe(event: ReactPointerEvent<HTMLDivElement>) {
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
        <IconButton
          ref={tooltipTrigger}
          aria-label="NTRP 설명"
          aria-expanded={tooltipOpen}
          aria-describedby={tooltipOpen ? tooltipId : undefined}
          icon={infoIcon}
          className="absolute top-1/2 -right-2.5 -translate-y-1/2"
          onClick={() => setTooltipOpen((open) => !open)}
        />
        {tooltipOpen && (
          <div className="pointer-events-none absolute right-(--spacing-padding-small) bottom-full left-0 z-10 mb-(--spacing-gap-small) flex justify-end">
            <Tooltip id={tooltipId} ref={tooltip}>
              {
                "NTRP는 테니스 실력을 나타내는 등급으로,\n높은 숫자일수록 좋은 실력을 뜻합니다"
              }
            </Tooltip>
          </div>
        )}
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
        className="-mx-(--spacing-padding-large) mt-(--spacing-gap-medium) grid touch-pan-y touch-pinch-zoom grid-cols-[56px_minmax(0,1fr)_56px] items-center gap-x-[6px] overflow-x-clip py-(--spacing-padding-small) select-none"
      >
        <div className="grid size-14 place-items-center">
          <IconButton
            aria-label="이전 NTRP"
            icon={backIcon}
            iconColor="var(--fg-neutral-tertiary)"
            disabled={!previous}
            className="disabled:opacity-30"
            onClick={() => previous && onChange(previous.value)}
          />
        </div>
        <div className="relative mx-auto h-14 w-full max-w-[262px] text-center [container-type:inline-size]">
          <output aria-live="polite" className="sr-only">
            {value}
          </output>
          <div
            ref={numberFrames}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [--active-slot-width:min(120px,calc((100cqw_-_2*var(--spacing-gap-medium))*120/238))] [--side-slot-width:calc((100%_-_var(--active-slot-width)_-_2*var(--spacing-gap-medium))/2)]"
          >
            {levels.map((level, position) => {
              const offset = position - index;
              const active = offset === 0;
              return (
                <span
                  key={level.value}
                  style={{
                    left: `calc(50% + (var(--active-slot-width) / 2 + var(--side-slot-width) / 2 + var(--spacing-gap-medium)) * ${offset} + ${dragOffset}px)`,
                  }}
                  className={[
                    "absolute top-0 h-full -translate-x-1/2",
                    dragOffset === 0 &&
                      "motion-safe:transition-[left,opacity] motion-safe:duration-200 motion-safe:ease-out",
                    Math.abs(offset) > 1 && "opacity-0",
                    active
                      ? "w-(--active-slot-width)"
                      : "w-(--side-slot-width)",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span
                    style={{
                      maskImage: `url("${level.graphic}")`,
                      maskSize: "contain",
                      maskRepeat: "no-repeat",
                      maskPosition: "center",
                    }}
                    className={[
                      "absolute top-1/2 left-1/2 aspect-[120/56] w-(--active-slot-width) -translate-1/2",
                      dragOffset === 0 &&
                        "motion-safe:transition-[scale,background-color] motion-safe:duration-200 motion-safe:ease-out",
                      active
                        ? "scale-100 bg-(--fg-accent-default)"
                        : "scale-70 bg-(--bg-neutral-weak)",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                </span>
              );
            })}
          </div>
        </div>
        <div className="grid size-14 place-items-center">
          <IconButton
            aria-label="다음 NTRP"
            icon={backIcon}
            iconClassName="-scale-x-100"
            iconColor="var(--fg-neutral-tertiary)"
            disabled={!next}
            className="disabled:opacity-30"
            onClick={() => next && onChange(next.value)}
          />
        </div>
      </div>
      <p className="typography-label-r-regular m-0 mt-(--spacing-gap-medium) rounded-(--radius-small) bg-(--bg-neutral-weak) px-(--spacing-padding-small) py-(--spacing-padding-medium) text-center break-keep whitespace-pre-line text-(color:--fg-neutral-tertiary)">
        {levels[index].description}
      </p>
    </section>
  );
}
