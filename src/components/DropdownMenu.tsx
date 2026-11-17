export type DropdownMenuItem = {
  label: string;
  onSelect: () => void;
  tone?: "default" | "danger";
};

type DropdownMenuProps = {
  open: boolean;
  items: readonly DropdownMenuItem[];
  onClose: () => void;
  label?: string;
  className?: string;
};

const toneStyles = {
  default: "text-(color:--fg-neutral-default)",
  danger: "text-(color:--fg-accent-assistive)",
};

export function DropdownMenu({
  open,
  items,
  onClose,
  label,
  className,
}: DropdownMenuProps) {
  if (!open) return null;

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-10"
      />
      <ul
        role="menu"
        aria-label={label}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
        className={[
          "absolute z-20 m-0 box-border flex w-[120px] list-none flex-col overflow-hidden rounded-(--radius-small) border border-solid border-(--border-neutral-default) bg-(--bg-neutral-default) p-0",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {items.map(
          ({ label: itemLabel, onSelect, tone = "default" }, index) => (
            <li key={itemLabel} role="none">
              <button
                type="button"
                role="menuitem"
                autoFocus={index === 0}
                onClick={() => {
                  onClose();
                  onSelect();
                }}
                className={`typography-label-r-medium box-border flex w-full cursor-pointer appearance-none items-center border-0 bg-(--bg-neutral-default) bg-[linear-gradient(var(--menu-overlay),var(--menu-overlay))] p-(--spacing-padding-medium) text-start [--menu-overlay:transparent] hover:[--menu-overlay:var(--bg-state-hover)] active:[--menu-overlay:var(--bg-state-pressed)] ${toneStyles[tone]}`}
              >
                {itemLabel}
              </button>
            </li>
          ),
        )}
      </ul>
    </>
  );
}
