type GoalProgressProps = {
  current: number;
  goal: number;
  label?: string;
  tone?: "default" | "danger";
  className?: string;
};

const barStyles = {
  default: "bg-(--fg-accent-default)",
  danger: "bg-(--fg-accent-assistive)",
};

export function GoalProgress({
  current,
  goal,
  label = "모집 현황",
  tone = "default",
  className,
}: GoalProgressProps) {
  const total = Number.isFinite(goal) ? Math.max(1, Math.trunc(goal)) : 1;
  const value = Number.isFinite(current)
    ? Math.min(total, Math.max(0, Math.trunc(current)))
    : 0;

  return (
    <div
      className={["flex w-full flex-col gap-(--spacing-gap-small)", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="typography-caption-r-bold flex items-center justify-between text-(color:--fg-neutral-tertiary)">
        <span>{label}</span>
        <span>
          {value}/{total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
        aria-valuetext={`${value}/${total}`}
        className="h-[7px] w-full overflow-hidden rounded-(--radius-full) bg-(--border-neutral-weak)"
      >
        <div
          className={`h-full rounded-(--radius-full) ${barStyles[tone]}`}
          style={{ width: `${(value / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
