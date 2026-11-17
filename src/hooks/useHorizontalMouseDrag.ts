import { useRef, type MouseEvent, type PointerEvent } from "react";

export function useHorizontalMouseDrag() {
  const mouseDrag = useRef<{
    pointerId: number;
    startX: number;
    startScrollLeft: number;
    originalSnapType?: string;
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
      drag.originalSnapType = list.style.scrollSnapType;
      list.style.scrollSnapType = "none";
    }
    list.scrollLeft = drag.startScrollLeft - distance;
  }

  function finishMouseDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = mouseDrag.current;
    if (drag?.pointerId === event.pointerId) {
      if (drag.originalSnapType !== undefined) {
        event.currentTarget.style.scrollSnapType = drag.originalSnapType;
      }
      mouseDrag.current = null;
    }
  }

  return {
    onPointerDown: startMouseDrag,
    onPointerMove: moveMouseDrag,
    onPointerUp: finishMouseDrag,
    onPointerCancel: finishMouseDrag,
    onLostPointerCapture: finishMouseDrag,
    onPointerLeave: (event: PointerEvent<HTMLDivElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId))
        finishMouseDrag(event);
    },
    onClickCapture: (event: MouseEvent<HTMLDivElement>) => {
      if (skipPointerClick.current && event.detail > 0) event.stopPropagation();
      skipPointerClick.current = false;
    },
  };
}
