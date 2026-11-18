type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
  mode?: "cumulative" | "current";
  label?: string;
  className?: string;
};

export function ProgressBar({
  currentStep,
  totalSteps,
  mode = "cumulative",
  label = "진행 단계",
  className,
}: ProgressBarProps) {
  const total = Number.isFinite(totalSteps)
    ? Math.max(1, Math.trunc(totalSteps))
    : 1;
  const current = Number.isFinite(currentStep)
    ? Math.min(total, Math.max(0, Math.trunc(currentStep)))
    : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-valuetext={`${total}단계 중 ${current}단계`}
      className={[
        "box-border flex w-full items-center gap-(--spacing-gap-micro) py-(--spacing-padding-large)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`h-(--unit-4) min-w-0 flex-1 rounded-(--radius-full) ${(mode === "current" ? index === current - 1 : index < current) ? "bg-(--bg-primary-strong)" : "bg-(--bg-neutral-weak)"}`}
        />
      ))}
    </div>
  );
}
