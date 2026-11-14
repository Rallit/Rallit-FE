import type { ReactNode } from "react";
import type { ActivityArea } from "@/apis/onboarding";
import { Checkbox } from "@/components/Checkbox";
import { SelectionChip } from "@/components/SelectionChip";
import { ActivityAreaPicker } from "./ActivityAreaPicker";

const matchTypes = [
  { value: "SINGLES", label: "단식" },
  { value: "RALLY", label: "랠리" },
  { value: "DOUBLES", label: "복식" },
  { value: "MIXED_DOUBLES", label: "혼합복식" },
] as const;

const timeSlots = [
  { value: "WEEKDAY_MORNING", label: "평일 오전" },
  { value: "WEEKDAY_AFTERNOON", label: "평일 오후" },
  { value: "WEEKEND_MORNING", label: "주말 오전" },
  { value: "WEEKEND_AFTERNOON", label: "주말 오후" },
] as const;

export type MatchPreferencesDraft = {
  activityAreas: ActivityArea[];
  sameGenderOnly: boolean;
  preferredMatchTypes: (typeof matchTypes)[number]["value"][];
  preferredTimeSlots: (typeof timeSlots)[number]["value"][];
};

type MatchPreferencesStepProps = {
  value: MatchPreferencesDraft;
  onChange: (value: MatchPreferencesDraft) => void;
};

function toggleSelection<T>(selected: T[], option: T) {
  return selected.includes(option)
    ? selected.filter((item) => item !== option)
    : [...selected, option];
}

function PreferenceGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="typography-label-r-medium p-0 text-(color:--fg-neutral-secondary)">
        {label}
      </legend>
      <div className="mt-(--spacing-gap-medium)">{children}</div>
    </fieldset>
  );
}

export function MatchPreferencesStep({
  value,
  onChange,
}: MatchPreferencesStepProps) {
  const mixedDoublesSelected =
    value.preferredMatchTypes.includes("MIXED_DOUBLES");

  return (
    <div className="mt-(--spacing-gap-extra-large) grid gap-(--spacing-gap-large) pb-(--spacing-padding-large)">
      <PreferenceGroup label="선호 방식">
        <div className="flex flex-wrap gap-(--spacing-gap-small)">
          {matchTypes.map(({ value: matchType, label }) => (
            <SelectionChip
              key={matchType}
              label={label}
              disabled={matchType === "MIXED_DOUBLES" && value.sameGenderOnly}
              selected={value.preferredMatchTypes.includes(matchType)}
              onClick={() =>
                onChange({
                  ...value,
                  preferredMatchTypes: toggleSelection(
                    value.preferredMatchTypes,
                    matchType,
                  ),
                })
              }
            />
          ))}
        </div>
        <label className="typography-label-l-medium mt-(--spacing-gap-medium) flex w-fit cursor-pointer items-center gap-(--spacing-gap-micro) text-(color:--fg-neutral-secondary) has-disabled:cursor-default has-disabled:text-(color:--fg-neutral-subtle)">
          <Checkbox
            checked={value.sameGenderOnly}
            disabled={mixedDoublesSelected}
            onChange={(event) =>
              onChange({
                ...value,
                sameGenderOnly: event.currentTarget.checked,
              })
            }
          />
          동성만
        </label>
      </PreferenceGroup>

      <ActivityAreaPicker
        value={value.activityAreas}
        onChange={(activityAreas) => onChange({ ...value, activityAreas })}
      />

      <PreferenceGroup label="선호 요일 및 시간대">
        <div className="flex flex-wrap gap-(--spacing-gap-small)">
          {timeSlots.map(({ value: timeSlot, label }) => (
            <SelectionChip
              key={timeSlot}
              label={label}
              className="h-[38px]!"
              selected={value.preferredTimeSlots.includes(timeSlot)}
              onClick={() =>
                onChange({
                  ...value,
                  preferredTimeSlots: toggleSelection(
                    value.preferredTimeSlots,
                    timeSlot,
                  ),
                })
              }
            />
          ))}
        </div>
      </PreferenceGroup>
    </div>
  );
}
