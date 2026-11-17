import { useEffect, useId, useRef } from "react";
import { ActionButton } from "@/components/ActionButton";

type MatchRequestDeleteDialogProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

export function MatchRequestDeleteDialog({
  onCancel,
  onConfirm,
}: MatchRequestDeleteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    cancelRef.current?.focus();
    return () => dialog.close();
  }, []);

  function cancel() {
    dialogRef.current?.close();
    onCancel();
  }

  function confirm() {
    dialogRef.current?.close();
    onConfirm();
  }

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        cancel();
      }}
      className="fixed inset-0 mx-auto my-0 box-border h-dvh max-h-none w-full max-w-[480px] items-center justify-items-center overflow-y-auto overscroll-y-contain border-0 bg-(--bg-layer-overlay) px-(--spacing-padding-large) py-(--spacing-padding-large) text-(color:--fg-neutral-default) open:grid backdrop:bg-transparent"
    >
      <div className="w-full max-w-[312px] -translate-y-3.5 rounded-(--radius-large) bg-(--bg-neutral-default)">
        <div className="grid gap-(--spacing-gap-small) px-(--spacing-padding-extra-large) pt-(--spacing-padding-extra-large)">
          <h2 id={titleId} className="typography-heading-bold m-0 break-keep">
            해당 요청을 삭제하시겠습니까?
          </h2>
          <p
            id={descriptionId}
            className="typography-body-regular m-0 break-keep text-(color:--fg-neutral-secondary)"
          >
            이 조건에 대해 더 이상
            <br />
            알림을 받지 않아요
          </p>
        </div>
        <div className="grid grid-cols-2 gap-(--spacing-gap-small) p-(--spacing-padding-large)">
          <ActionButton
            ref={cancelRef}
            variant="tertiary"
            size="M"
            fullWidth
            onClick={cancel}
          >
            취소
          </ActionButton>
          <ActionButton size="M" fullWidth onClick={confirm}>
            삭제
          </ActionButton>
        </div>
      </div>
    </dialog>
  );
}
