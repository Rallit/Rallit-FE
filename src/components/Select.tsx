import { useLayoutEffect, useRef } from "react";
import type { ComponentProps } from "react";
import addIcon from "../../assets/icons/add.svg";
import downIcon from "../../assets/icons/chevron-down.svg";
import { SelectionChip } from "./SelectionChip";

type SelectProps = Omit<
  ComponentProps<"button">,
  "children" | "type" | "value"
> & {
  placeholder?: string;
} & (
    | { value?: string; chips?: never; onRemove?: never; chipTrigger?: never }
    | {
        value?: never;
        chipTrigger?: "add" | "dropdown";
        chips: readonly { id: string; label: string }[];
        onRemove: (id: string) => void;
      }
  );

export function Select({
  value,
  chips,
  chipTrigger = "add",
  onRemove,
  placeholder = "선택해주세요",
  className,
  disabled,
  ...props
}: SelectProps) {
  const selectRef = useRef<HTMLDivElement>(null);
  const chipListRef = useRef<HTMLDivElement>(null);
  const pendingRemoval = useRef<{ id: string; index: number } | null>(null);

  useLayoutEffect(() => {
    const removed = pendingRemoval.current;
    if (!removed || chips?.some(({ id }) => id === removed.id)) return;

    pendingRemoval.current = null;
    if (disabled || document.activeElement !== document.body) return;

    const buttons = chipListRef.current?.querySelectorAll("button");
    const nextButton = buttons?.[removed.index] ?? buttons?.[removed.index - 1];
    (
      nextButton ??
      selectRef.current?.querySelector<HTMLButtonElement>(
        "[data-select-trigger]",
      )
    )?.focus();
  }, [chips, disabled]);

  const hasChips = Boolean(chips?.length);
  const chipsWithDropdown = hasChips && chipTrigger === "dropdown";
  const triggerStyle = hasChips
    ? "size-(--unit-24) shrink-0 items-center border-0 bg-transparent p-0"
    : [
        "typography-body-medium box-border h-[52px] w-full min-w-0 items-start justify-between gap-(--spacing-gap-small) rounded-(--radius-small) border border-solid bg-(--bg-neutral-default) p-(--spacing-padding-medium) text-start",
        "border-(--border-neutral-default) focus:border-(--border-brand-focus) aria-expanded:border-(--border-brand-focus)",
        value
          ? "text-(color:--fg-neutral-default)"
          : "text-(color:--fg-neutral-subtle)",
      ].join(" ");

  const trigger = (
    <button
      {...props}
      data-select-trigger
      type="button"
      disabled={disabled}
      className={`flex cursor-pointer appearance-none disabled:cursor-default ${triggerStyle}`}
    >
      {!hasChips && (
        <span className="min-w-0 truncate">{value || placeholder}</span>
      )}
      <img
        src={hasChips && !chipsWithDropdown ? addIcon : downIcon}
        alt={hasChips && !chipsWithDropdown ? "선택 항목 추가" : ""}
        className="block shrink-0"
      />
    </button>
  );

  return (
    <div
      ref={selectRef}
      className={["w-full min-w-0", className].filter(Boolean).join(" ")}
    >
      {chips?.length ? (
        <div
          className={[
            "box-border flex min-h-[52px] items-center justify-between gap-(--spacing-gap-small) py-(--spacing-padding-micro)",
            chipsWithDropdown &&
              "rounded-(--radius-small) border border-solid border-(--border-neutral-default) px-(--spacing-padding-small) focus-within:border-(--border-brand-focus)",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div
            ref={chipListRef}
            className={`flex min-w-0 flex-wrap ${chipsWithDropdown ? "gap-(--spacing-gap-micro)" : "gap-(--spacing-gap-small)"}`}
          >
            {chips.map(({ id, label }, index) => (
              <SelectionChip
                key={id}
                label={label}
                disabled={disabled}
                onRemove={(event) => {
                  if (document.activeElement === event.currentTarget) {
                    pendingRemoval.current = { id, index };
                  }
                  onRemove(id);
                }}
                className="max-w-full"
              />
            ))}
          </div>
          {trigger}
        </div>
      ) : (
        trigger
      )}
    </div>
  );
}
