import { useEffect, useEffectEvent } from "react";
import checkIcon from "../../assets/icons/toast-check-round.svg";

type ToastProps = {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
  icon?: string;
  className?: string;
};

export function Toast({
  message,
  onDismiss,
  durationMs = 3000,
  icon = checkIcon,
  className,
}: ToastProps) {
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(() => dismiss(), durationMs);
    return () => window.clearTimeout(timeout);
  }, [message, durationMs]);

  return (
    <div role="status" className={className}>
      {message && (
        <div className="box-border inline-flex h-12 w-fit max-w-full items-center gap-(--spacing-gap-small) rounded-(--radius-full) bg-(--bg-neutral-default) pr-(--spacing-padding-large) pl-(--spacing-padding-medium) shadow-[0_2px_30px_var(--gray-alpha-100)]">
          <img src={icon} alt="" className="block shrink-0" />
          <span className="typography-body-bold min-w-0 truncate text-(color:--fg-neutral-secondary)">
            {message}
          </span>
        </div>
      )}
    </div>
  );
}
