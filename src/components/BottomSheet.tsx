import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { Header } from "./Header";

type BottomSheetProps = {
  id: string;
  title: string;
  open: boolean;
  onDismiss: () => void;
  children: ReactNode;
  className?: string;
};

export function BottomSheet({
  id,
  title,
  open,
  onDismiss,
  children,
  className = "overflow-y-auto",
}: BottomSheetProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const startedOnBackdrop = useRef(false);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;

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
    viewport?.addEventListener("resize", syncViewport);
    viewport?.addEventListener("scroll", syncViewport);
    window.addEventListener("resize", syncViewport);

    return () => {
      viewport?.removeEventListener("resize", syncViewport);
      viewport?.removeEventListener("scroll", syncViewport);
      window.removeEventListener("resize", syncViewport);
      startedOnBackdrop.current = false;
      dialog.close();
    };
  }, [open]);

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
          onDismiss();
        startedOnBackdrop.current = false;
      }}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      className="fixed inset-x-0 top-[var(--sheet-viewport-top,0px)] bottom-auto mx-auto my-0 box-border h-[var(--sheet-viewport-height,100dvh)] max-h-none w-full max-w-[480px] flex-col justify-end overflow-hidden overscroll-y-none border-0 bg-transparent p-0 pt-[env(safe-area-inset-top,0px)] text-(color:--fg-neutral-default) open:flex backdrop:bg-[linear-gradient(#232323b3,#232323b3)] backdrop:bg-size-[min(100%,480px)_100%] backdrop:bg-center backdrop:bg-no-repeat"
    >
      <div
        className={[
          "box-border max-h-full w-full scrollbar-none overscroll-y-none rounded-t-(--radius-large) bg-(--bg-neutral-default) pb-[max(var(--spacing-padding-large),env(safe-area-inset-bottom,0px))] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]",
          className,
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="shrink-0">
            <Header
              variant="sheet"
              title={title}
              titleId={titleId}
              onClose={onDismiss}
            />
          </div>
          {children}
        </div>
      </div>
    </dialog>
  );
}
