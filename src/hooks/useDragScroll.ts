import {
  useRef,
  type DragEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";

const DRAG_START_DISTANCE = 5;
const PAGE_CHANGE_DISTANCE = 50;
const SNAP_RESTORE_FALLBACK_MS = 600;

type DragState = {
  pointerId: number;
  startX: number;
  startScrollLeft: number;
  dragging: boolean;
};

function getCenteredScrollPositions(container: HTMLElement) {
  return Array.from(container.children, (child) => {
    const item = child as HTMLElement;
    return item.offsetLeft + item.offsetWidth / 2 - container.clientWidth / 2;
  });
}

function findNearestIndex(positions: number[], scrollLeft: number) {
  let nearest = 0;
  positions.forEach((position, index) => {
    if (
      Math.abs(position - scrollLeft) <
      Math.abs(positions[nearest] - scrollLeft)
    ) {
      nearest = index;
    }
  });
  return nearest;
}

/**
 * 마우스로 가로 스크롤 목록을 끌어서 넘기게 합니다.
 * 터치·트랙패드는 브라우저 기본 스크롤을 그대로 사용합니다.
 * 항목이 가운데 정렬(snap-center)되는 목록을 기준으로 하며,
 * 목록 요소에 position: relative가 있어야 항목 위치를 정확히 계산합니다.
 */
export function useDragScroll<T extends HTMLElement>() {
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  const finishDrag = (container: T, state: DragState) => {
    const positions = getCenteredScrollPositions(container);
    if (positions.length === 0) {
      container.style.scrollSnapType = "";
      return;
    }

    const startIndex = findNearestIndex(positions, state.startScrollLeft);
    const moved = container.scrollLeft - state.startScrollLeft;
    let targetIndex = findNearestIndex(positions, container.scrollLeft);
    if (targetIndex === startIndex && Math.abs(moved) >= PAGE_CHANGE_DISTANCE) {
      targetIndex = Math.min(
        positions.length - 1,
        Math.max(0, startIndex + Math.sign(moved)),
      );
    }

    let restored = false;
    const restoreSnap = () => {
      if (restored || dragRef.current?.dragging) return;
      restored = true;
      container.style.scrollSnapType = "";
    };
    container.addEventListener("scrollend", restoreSnap, { once: true });
    window.setTimeout(restoreSnap, SNAP_RESTORE_FALLBACK_MS);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    container.scrollTo({
      left: positions[targetIndex],
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const onPointerDown = (event: PointerEvent<T>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    suppressClickRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      dragging: false,
    };
  };

  const onPointerMove = (event: PointerEvent<T>) => {
    const state = dragRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    if ((event.buttons & 1) === 0) {
      dragRef.current = null;
      if (state.dragging) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        finishDrag(event.currentTarget, state);
      }
      return;
    }

    const distance = event.clientX - state.startX;
    if (!state.dragging) {
      if (Math.abs(distance) < DRAG_START_DISTANCE) return;
      state.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.style.scrollSnapType = "none";
    }
    event.currentTarget.scrollLeft = state.startScrollLeft - distance;
  };

  const endPointer = (event: PointerEvent<T>) => {
    const state = dragRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (!state.dragging) return;
    suppressClickRef.current = true;
    finishDrag(event.currentTarget, state);
  };

  const onClickCapture = (event: MouseEvent<T>) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const onDragStart = (event: DragEvent<T>) => {
    event.preventDefault();
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endPointer,
    onPointerCancel: endPointer,
    onClickCapture,
    onDragStart,
  };
}
