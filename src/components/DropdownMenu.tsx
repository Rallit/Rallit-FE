import { useLayoutEffect, useRef, type KeyboardEvent } from "react";

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

const MENU_ITEM_SELECTOR = '[role="menuitem"]';

export function DropdownMenu({
  open,
  items,
  onClose,
  label,
  className,
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLUListElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const closingRef = useRef(false);

  useLayoutEffect(() => {
    if (!open) return;

    closingRef.current = false;
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    menuRef.current
      ?.querySelector<HTMLButtonElement>(MENU_ITEM_SELECTOR)
      ?.focus();
  }, [open]);

  function close(restoreFocus: boolean) {
    if (closingRef.current) return;

    closingRef.current = true;
    onClose();
    if (restoreFocus) returnFocusRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }

    const menuItems = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        MENU_ITEM_SELECTOR,
      ),
    );
    const current = menuItems.findIndex(
      (item) => item === document.activeElement,
    );
    const last = menuItems.length - 1;
    const targets: Record<string, number> = {
      ArrowDown: current >= last ? 0 : current + 1,
      ArrowUp: current <= 0 ? last : current - 1,
      Home: 0,
      End: last,
    };
    const next = targets[event.key];
    if (next === undefined) return;

    event.preventDefault();
    menuItems[next]?.focus();
  }

  if (!open) return null;

  return (
    <>
      <div
        aria-hidden="true"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => close(false)}
        className="fixed inset-0 z-10"
      />
      <ul
        ref={menuRef}
        role="menu"
        aria-label={label}
        onKeyDown={handleKeyDown}
        onMouseDown={(event) => event.preventDefault()}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            close(false);
        }}
        className={[
          "absolute z-20 m-0 box-border flex w-[120px] list-none flex-col overflow-hidden rounded-(--radius-small) border border-solid border-(--border-neutral-default) bg-(--bg-neutral-default) p-0",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {items.map(({ label: itemLabel, onSelect, tone = "default" }) => (
          <li key={itemLabel} role="none">
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                close(true);
                onSelect();
              }}
              className={`typography-label-r-medium box-border flex w-full cursor-pointer appearance-none items-center border-0 bg-(--bg-neutral-default) bg-[linear-gradient(var(--menu-overlay),var(--menu-overlay))] p-(--spacing-padding-medium) text-start [--menu-overlay:transparent] hover:[--menu-overlay:var(--bg-state-hover)] active:[--menu-overlay:var(--bg-state-pressed)] ${toneStyles[tone]}`}
            >
              {itemLabel}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
