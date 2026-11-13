import type { ComponentProps, MouseEventHandler } from "react";
import closeIcon from "../../assets/icons/close.svg";

type SelectionChipProps = Omit<
  ComponentProps<"button">,
  "children" | "type" | "aria-pressed"
> & { label: string };

type ToggleChipProps = SelectionChipProps & {
  selected?: boolean;
  onRemove?: never;
};

type RemovableChipProps = Omit<SelectionChipProps, "onClick"> & {
  onRemove: MouseEventHandler<HTMLButtonElement>;
  selected?: never;
  onClick?: never;
};

const baseStyles =
  "box-border inline-flex h-10 w-fit appearance-none items-center justify-center rounded-(--radius-full) border-0 py-(--spacing-padding-small) whitespace-nowrap";

const toggleStyles = [
  "typography-label-l-medium cursor-pointer px-(--spacing-padding-large)",
  "bg-[linear-gradient(var(--chip-overlay),var(--chip-overlay))] [--chip-overlay:transparent]",
  "enabled:hover:[--chip-overlay:var(--bg-state-hover)] enabled:active:[--chip-overlay:var(--bg-state-pressed)]",
  "disabled:cursor-default disabled:bg-(--bg-state-disabled) disabled:text-(color:--fg-neutral-subtle)",
].join(" ");

export function SelectionChip({
  label,
  selected = false,
  disabled,
  onRemove,
  onClick,
  className,
  "aria-label": accessibleLabel,
  ...props
}: ToggleChipProps | RemovableChipProps) {
  const styles = onRemove
    ? "typography-label-l-medium cursor-pointer gap-(--spacing-gap-micro) bg-(--bg-neutral-weak) px-(--spacing-padding-medium) text-(color:--fg-neutral-default) disabled:cursor-default"
    : [
        toggleStyles,
        selected && !disabled
          ? "bg-(--bg-secondary-default) text-(color:--fg-neutral-inverse)"
          : "bg-(--bg-neutral-default) text-(color:--fg-neutral-secondary) inset-ring inset-ring-(--border-neutral-default)",
      ].join(" ");

  return (
    <button
      {...props}
      type="button"
      className={[baseStyles, styles, className].filter(Boolean).join(" ")}
      aria-label={accessibleLabel ?? (onRemove ? `${label} 삭제` : undefined)}
      aria-pressed={onRemove ? undefined : selected}
      disabled={disabled}
      onClick={onRemove ?? onClick}
    >
      <span className="min-w-0 truncate">{label}</span>
      {onRemove && <img src={closeIcon} alt="" className="shrink-0" />}
    </button>
  );
}
