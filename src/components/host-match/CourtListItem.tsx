import locationIcon from "../../../assets/icons/location.svg";
import type { CourtOption } from "@/features/host-match/form";

type CourtListItemProps = {
  court: CourtOption;
  onSelect: () => void;
};

export function CourtListItem({ court, onSelect }: CourtListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="box-border flex w-full cursor-pointer appearance-none items-center gap-(--spacing-gap-medium) border-0 bg-(--bg-neutral-default) bg-[linear-gradient(var(--court-overlay),var(--court-overlay))] px-(--spacing-padding-large) py-(--spacing-padding-medium) text-start [--court-overlay:transparent] active:[--court-overlay:var(--bg-state-pressed)]"
    >
      <span className="box-border size-15 shrink-0 overflow-hidden rounded-(--radius-small) border border-solid border-(--border-neutral-weak) bg-(--bg-neutral-weak)">
        {court.imageUrl && (
          <img src={court.imageUrl} alt="" className="size-full object-cover" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-(--spacing-gap-micro)">
        <span className="typography-body-medium truncate text-(color:--fg-neutral-default)">
          {court.name}
        </span>
        <span className="flex min-w-0 items-center gap-(--spacing-gap-micro)">
          <img src={locationIcon} alt="" className="block size-4 shrink-0" />
          <span className="typography-label-r-regular truncate text-(color:--fg-neutral-secondary)">
            {court.address}
          </span>
        </span>
      </span>
    </button>
  );
}
