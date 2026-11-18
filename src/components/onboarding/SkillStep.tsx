import type { SkillDraft } from "@/features/onboarding/form";
import { NtrpPicker } from "./NtrpPicker";
import { TennisStartPicker } from "./TennisStartPicker";

type SkillStepProps = {
  value: SkillDraft;
  onChange: (value: SkillDraft) => void;
};

export function SkillStep({ value, onChange }: SkillStepProps) {
  return (
    <div className="mt-(--spacing-gap-extra-large) grid gap-(--spacing-gap-large) pb-(--spacing-padding-large)">
      <TennisStartPicker
        value={value.tennisStart}
        onChange={(tennisStart) => onChange({ ...value, tennisStart })}
      />
      <NtrpPicker
        value={value.ntrp}
        onChange={(ntrp) => onChange({ ...value, ntrp })}
      />
    </div>
  );
}
