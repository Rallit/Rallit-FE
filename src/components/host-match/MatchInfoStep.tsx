import { useId } from "react";
import type { OnboardingProfile } from "@/apis/onboarding.types";
import { Checkbox } from "@/components/Checkbox";
import { NumberStepper } from "@/components/NumberStepper";
import { RangeSlider } from "@/components/RangeSlider";
import { SelectionChip } from "@/components/SelectionChip";
import type { MatchInfoDraft } from "@/features/host-match/form";
import {
  MAX_NTRP,
  MIN_NTRP,
  NTRP_STEP,
  matchFormats,
} from "@/features/match-request/form";
import { formatRequestedNtrp } from "@/features/match-request/summary";

type MatchInfoStepProps = {
  value: MatchInfoDraft;
  onChange: (value: MatchInfoDraft) => void;
  hostGender?: OnboardingProfile["gender"];
};

export function MatchInfoStep({
  value,
  onChange,
  hostGender,
}: MatchInfoStepProps) {
  const labelId = useId();
  const maleDisabled = value.sameGenderOnly && hostGender !== "MALE";
  const femaleDisabled = value.sameGenderOnly && hostGender !== "FEMALE";

  function changeSameGenderOnly(checked: boolean) {
    onChange({
      ...value,
      sameGenderOnly: checked,
      maleRecruitCount:
        checked && hostGender !== "MALE" ? 0 : value.maleRecruitCount,
      femaleRecruitCount:
        checked && hostGender !== "FEMALE" ? 0 : value.femaleRecruitCount,
    });
  }

  return (
    <div className="mt-(--spacing-gap-extra-large) grid gap-(--spacing-gap-extra-large)">
      <section className="grid gap-(--spacing-gap-medium)">
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
            disabled={!hostGender || value.matchFormat === "MIXED_DOUBLES"}
            onChange={(event) =>
              changeSameGenderOnly(event.currentTarget.checked)
            }
          />
          동성만
        </label>
      </section>
      <section className="grid gap-(--spacing-gap-medium)">
        <h2 className="typography-label-r-medium m-0 text-(color:--fg-neutral-secondary)">
          모집 인원
        </h2>
        <div className="grid grid-cols-2 gap-(--spacing-gap-small)">
          <NumberStepper
            label="남자"
            value={value.maleRecruitCount}
            disabled={maleDisabled}
            onChange={(maleRecruitCount) =>
              onChange({ ...value, maleRecruitCount })
            }
          />
          <NumberStepper
            label="여자"
            value={value.femaleRecruitCount}
            disabled={femaleDisabled}
            onChange={(femaleRecruitCount) =>
              onChange({ ...value, femaleRecruitCount })
            }
          />
        </div>
      </section>
      <section className="grid gap-(--spacing-gap-medium)">
        <h2 className="typography-label-r-medium m-0 text-(color:--fg-neutral-secondary)">
          권장 NTRP
        </h2>
        <RangeSlider
          min={MIN_NTRP}
          max={MAX_NTRP}
          step={NTRP_STEP}
          minLabel="최소 권장 NTRP"
          maxLabel="최대 권장 NTRP"
          formatValue={formatRequestedNtrp}
          value={value.ntrp}
          onChange={(ntrp) => onChange({ ...value, ntrp })}
        />
      </section>
    </div>
  );
}
