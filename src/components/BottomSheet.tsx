import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { Header } from "./Header";

const backdropStyles = {
  strong: "bg-[#232323b3]",
  overlay: "bg-(--bg-layer-overlay)",
} as const;

type DismissSheet = (onConfirm?: () => void) => void;

type SheetContentProps = {
  children: (dismiss: DismissSheet) => ReactNode;
  dismiss: DismissSheet;
};

function SheetContent({ children, dismiss }: SheetContentProps) {
  return children(dismiss);
}

function animateSheet(
  panel: HTMLElement,
  backdrop: HTMLElement,
  opening: boolean,
  previous: Animation[] = [],
) {
  const startTransform = opening
    ? "translateY(100%)"
    : getComputedStyle(panel).transform;
  const startOpacity = opening ? 0 : Number(getComputedStyle(backdrop).opacity);
  previous.forEach((animation) => animation.cancel());

  const timing: KeyframeAnimationOptions = {
    duration: opening ? 240 : 180,
    easing: opening ? "ease-out" : "ease-in",
    fill: "both",
  };
  return [
    panel.animate(
      [
        { transform: startTransform },
        { transform: opening ? "translateY(0)" : "translateY(100%)" },
      ],
      timing,
    ),
    backdrop.animate(
      [{ opacity: startOpacity }, { opacity: opening ? 1 : 0 }],
      timing,
    ),
  ];
}

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type BottomSheetProps = {
  id: string;
  title: string;
  open: boolean;
  onDismiss: () => void;
  children: (dismiss: DismissSheet) => ReactNode;
  className?: string;
  backdrop?: keyof typeof backdropStyles;
};

export function BottomSheet({
  id,
  title,
  open,
  onDismiss,
  children,
  className = "overflow-y-auto",
  backdrop = "strong",
}: BottomSheetProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const animations = useRef<Animation[]>([]);
  const closing = useRef(false);
  const startedOnBackdrop = useRef(false);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const panel = panelRef.current;
    const scrim = backdropRef.current;
    if (!open || !dialog || !panel || !scrim) return;

    const viewport = window.visualViewport;
    const { style } = dialog;

    function syncViewport() {
      style.setProperty(
        "--sheet-viewport-top",
        (viewport?.offsetTop ?? 0) + "px",
      );
      style.setProperty(
        "--sheet-viewport-height",
        (viewport?.height ?? window.innerHeight) + "px",
      );
    }

    syncViewport();
    dialog.showModal();
    syncViewport();
    if (!reduceMotion()) animations.current = animateSheet(panel, scrim, true);
    viewport?.addEventListener("resize", syncViewport);
    viewport?.addEventListener("scroll", syncViewport);
    window.addEventListener("resize", syncViewport);

    return () => {
      viewport?.removeEventListener("resize", syncViewport);
      viewport?.removeEventListener("scroll", syncViewport);
      window.removeEventListener("resize", syncViewport);
      startedOnBackdrop.current = false;
      animations.current.forEach((animation) => animation.cancel());
      animations.current = [];
      closing.current = false;
      panel.inert = false;
      dialog.close();
    };
  }, [open]);

  const dismiss: DismissSheet = (onConfirm) => {
    if (closing.current) return;
    closing.current = true;

    const finish = () => {
      onConfirm?.();
      onDismiss();
    };
    const panel = panelRef.current;
    const scrim = backdropRef.current;
    if (!panel || !scrim || reduceMotion()) {
      finish();
      return;
    }

    panel.inert = true;
    animations.current = animateSheet(panel, scrim, false, animations.current);
    void Promise.all(
      animations.current.map((animation) => animation.finished),
    ).then(finish, () => {});
  };

  return (
    <dialog
      ref={dialogRef}
      id={id}
      data-bottom-sheet
      aria-labelledby={titleId}
      onPointerDown={(event) => {
        startedOnBackdrop.current =
          event.isPrimary &&
          event.button === 0 &&
          event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (startedOnBackdrop.current && event.target === event.currentTarget)
          dismiss();
        startedOnBackdrop.current = false;
      }}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      className="fixed inset-x-0 top-[var(--sheet-viewport-top,0px)] bottom-auto mx-auto my-0 box-border h-[var(--sheet-viewport-height,100dvh)] max-h-none w-full max-w-[480px] flex-col justify-end overflow-hidden overscroll-y-none border-0 bg-transparent p-0 pt-[env(safe-area-inset-top,0px)] text-(color:--fg-neutral-default) open:flex backdrop:bg-transparent"
    >
      <div
        ref={backdropRef}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${backdropStyles[backdrop]}`}
      />
      <div
        ref={panelRef}
        className={[
          "relative box-border max-h-full w-full scrollbar-none overscroll-y-none rounded-t-(--radius-large) bg-(--bg-neutral-default) pb-[max(var(--spacing-padding-large),env(safe-area-inset-bottom,0px))] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]",
          className,
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="shrink-0">
            <Header
              variant="sheet"
              title={title}
              titleId={titleId}
              onClose={() => dismiss()}
            />
          </div>
          <SheetContent dismiss={dismiss}>{children}</SheetContent>
        </div>
      </div>
    </dialog>
  );
}
