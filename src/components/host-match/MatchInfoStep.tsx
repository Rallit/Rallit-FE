import { useId } from "react";
import type { OnboardingProfile } from "@/apis/onboarding.types";
import { Checkbox } from "@/components/Checkbox";
import { NumberStepper } from "@/components/NumberStepper";
import { RangeSlider } from "@/components/RangeSlider";
import { SelectionChip } from "@/components/SelectionChip";
import { TextInputField } from "@/components/TextInputField";
import {
  formatFee,
  toFeeDigits,
  type MatchInfoDraft,
} from "@/features/host-match/form";
import {
  MAX_NTRP,
  MIN_NTRP,
  NTRP_STEP,
  matchFormats,
} from "@/features/match-request/form";
import { formatRequestedNtrp } from "@/features/match-request/summary";

const ageGroups = [
  { value: "TEENS", label: "10대" },
  { value: "TWENTIES", label: "20대" },
  { value: "THIRTIES", label: "30대" },
  { value: "FORTIES", label: "40대" },
  { value: "FIFTIES", label: "50대" },
  { value: "SIXTIES_OR_OLDER", label: "60대 이상" },
] as const;

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
  const ageGroupLabelId = useId();
  const feeInputId = useId();
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

  function toggleAgeGroup(ageGroup: OnboardingProfile["ageGroup"]) {
    const { preferredAgeGroups } = value;
    const nextAgeGroups = preferredAgeGroups.includes(ageGroup)
      ? preferredAgeGroups.filter((group) => group !== ageGroup)
      : [...preferredAgeGroups, ageGroup];
    const anyAgeGroup = ageGroups.every(({ value: group }) =>
      nextAgeGroups.includes(group),
    );

    onChange({
      ...value,
      preferredAgeGroups: anyAgeGroup ? [] : nextAgeGroups,
      anyAgeGroup,
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
      <section className="grid gap-(--spacing-gap-medium)">
        <h2
          id={ageGroupLabelId}
          className="typography-label-r-medium m-0 text-(color:--fg-neutral-secondary)"
        >
          선호 나이대
        </h2>
        <div
          role="group"
          aria-labelledby={ageGroupLabelId}
          className="flex flex-wrap gap-(--spacing-gap-small)"
        >
          {ageGroups.map(({ value: ageGroup, label }) => (
            <SelectionChip
              key={ageGroup}
              label={label}
              selected={
                !value.anyAgeGroup &&
                value.preferredAgeGroups.includes(ageGroup)
              }
              disabled={value.anyAgeGroup}
              onClick={() => toggleAgeGroup(ageGroup)}
            />
          ))}
        </div>
        <label className="typography-label-l-medium flex w-fit cursor-pointer items-center gap-(--spacing-gap-micro) text-(color:--fg-neutral-secondary)">
          <Checkbox
            checked={value.anyAgeGroup}
            onChange={(event) =>
              onChange({ ...value, anyAgeGroup: event.currentTarget.checked })
            }
          />
          상관없음
        </label>
      </section>
      <div className="grid gap-(--spacing-gap-medium)">
        <label
          htmlFor={feeInputId}
          className="typography-label-r-medium text-(color:--fg-neutral-secondary)"
        >
          참가비
        </label>
        <TextInputField
          id={feeInputId}
          inputMode="numeric"
          placeholder="참가비를 입력해주세요"
          value={formatFee(value.fee)}
          onChange={(event) =>
            onChange({ ...value, fee: toFeeDigits(event.currentTarget.value) })
          }
        />
      </div>
    </div>
  );
}
