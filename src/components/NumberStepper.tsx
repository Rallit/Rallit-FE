import addIcon from "../../assets/icons/add-small.svg";
import minusIcon from "../../assets/icons/minus.svg";
import { IconButton } from "./IconButton";

type NumberStepperProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
};

function getIconColor(enabled: boolean) {
  return enabled ? "var(--fg-neutral-default)" : "var(--fg-neutral-subtle)";
}

export function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  disabled = false,
  className,
}: NumberStepperProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <div
      role="group"
      aria-label={label}
      className={[
        "box-border flex w-full flex-col items-center rounded-(--radius-medium) border border-solid border-(--border-neutral-default) bg-(--bg-neutral-default) pt-(--spacing-padding-small)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={`typography-label-r-medium w-full text-center ${disabled ? "text-(color:--fg-neutral-subtle)" : "text-(color:--fg-neutral-secondary)"}`}
      >
        {label}
      </span>
      <div className="box-border flex w-full items-center justify-center gap-(--spacing-gap-medium) px-(--spacing-padding-medium) py-(--spacing-padding-small)">
        <IconButton
          size="small"
          icon={minusIcon}
          iconColor={getIconColor(canDecrease)}
          aria-label={`${label} 줄이기`}
          disabled={!canDecrease}
          onClick={() => onChange(value - 1)}
          className="-my-1"
        />
        <output
          aria-live="polite"
          className={`typography-body-medium w-6 text-center ${disabled ? "text-(color:--fg-neutral-subtle)" : "text-(color:--fg-neutral-default)"}`}
        >
          {value}
        </output>
        <IconButton
          size="small"
          icon={addIcon}
          iconColor={getIconColor(canIncrease)}
          aria-label={`${label} 늘리기`}
          disabled={!canIncrease}
          onClick={() => onChange(value + 1)}
          className="-my-1"
        />
      </div>
    </div>
  );
}
