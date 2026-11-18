type DistrictOption = { id: string; label: string };

type CascadingMenuProps = {
  options: readonly DistrictOption[];
  selectedIds: readonly string[];
  onToggle: (id: string) => void;
  label?: string;
};

export function CascadingMenu({
  options,
  selectedIds,
  onToggle,
  label = "활동 지역",
}: CascadingMenuProps) {
  return (
    <ul
      aria-label={label}
      className="m-0 w-full list-none border-x-0 border-t border-b-0 border-solid border-(--border-neutral-weak) p-0"
    >
      {options.map(({ id, label: districtLabel }) => {
        const selected = selectedIds.includes(id);
        const stateStyles = selected
          ? "typography-body-medium bg-(--bg-secondary-inverse) text-(color:--fg-accent-default)"
          : [
              "typography-label-l-regular bg-(--bg-neutral-default) text-(color:--fg-neutral-default)",
              "[--district-overlay:transparent] bg-[linear-gradient(var(--district-overlay),var(--district-overlay))]",
              "hover:[--district-overlay:var(--bg-state-hover)] active:[--district-overlay:var(--bg-state-pressed)]",
            ].join(" ");

        return (
          <li key={id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(id)}
              className={`box-border flex h-[50px] w-full cursor-pointer appearance-none items-center border-x-0 border-t-0 border-b border-solid border-(--border-neutral-weak) px-(--spacing-padding-large) py-0 text-start ${stateStyles}`}
            >
              <span className="truncate">{districtLabel}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
