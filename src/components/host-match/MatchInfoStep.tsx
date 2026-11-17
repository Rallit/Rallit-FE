import { useId } from "react";
import { Checkbox } from "@/components/Checkbox";
import { SelectionChip } from "@/components/SelectionChip";
import type { MatchInfoDraft } from "@/features/host-match/form";
import { matchFormats } from "@/features/match-request/form";

type MatchInfoStepProps = {
  value: MatchInfoDraft;
  onChange: (value: MatchInfoDraft) => void;
};

export function MatchInfoStep({ value, onChange }: MatchInfoStepProps) {
  const labelId = useId();

  return (
    <section className="mt-(--spacing-gap-extra-large) grid gap-(--spacing-gap-medium)">
      <h2
        id={labelId}
        className="typography-label-r-medium m-0 text-(color:--fg-neutral-secondary)"
      >
        매치 유형
      </h2>
      <div
        role="group"
        aria-labelledby={labelId}
        className="flex flex-wrap items-center gap-(--spacing-gap-small)"
      >
        {matchFormats.map(({ value: format, label }) => (
          <SelectionChip
            key={format}
            label={label}
            selected={value.matchFormat === format}
            disabled={value.sameGenderOnly && format === "MIXED_DOUBLES"}
            onClick={() => onChange({ ...value, matchFormat: format })}
          />
        ))}
      </div>
      <label className="typography-label-l-medium flex w-fit cursor-pointer items-center gap-(--spacing-gap-micro) text-(color:--fg-neutral-secondary) has-disabled:cursor-default has-disabled:text-(color:--fg-neutral-subtle)">
        <Checkbox
          checked={value.sameGenderOnly}
          disabled={value.matchFormat === "MIXED_DOUBLES"}
          onChange={(event) =>
            onChange({ ...value, sameGenderOnly: event.currentTarget.checked })
          }
        />
        동성만
      </label>
    </section>
  );
}
