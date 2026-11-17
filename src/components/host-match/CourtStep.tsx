import { TextInputField } from "@/components/TextInputField";
import {
  formatFee,
  toFeeDigits,
  type CourtDraft,
} from "@/features/host-match/form";

type CourtStepProps = {
  value: CourtDraft;
  onChange: (value: CourtDraft) => void;
};

const labelStyle =
  "typography-label-r-medium text-(color:--fg-neutral-secondary)";

export function CourtStep({ value, onChange }: CourtStepProps) {
  return (
    <div className="mt-(--spacing-gap-extra-large) grid gap-(--spacing-gap-extra-large) pb-(--spacing-padding-large)">
      <div className="flex items-start gap-(--spacing-gap-small)">
        <div className="grid w-[120px] shrink-0 gap-(--spacing-gap-medium)">
          <label htmlFor="court-number" className={labelStyle}>
            코트 번호
          </label>
          <TextInputField
            id="court-number"
            placeholder="번호 입력"
            value={value.courtNumber}
            onChange={(event) =>
              onChange({ ...value, courtNumber: event.currentTarget.value })
            }
          />
        </div>
      </div>

      <div className="grid gap-(--spacing-gap-medium)">
        <label htmlFor="court-fee" className={labelStyle}>
          이용료
        </label>
        <TextInputField
          id="court-fee"
          inputMode="numeric"
          placeholder="금액만 입력해주세요"
          value={formatFee(value.fee)}
          onChange={(event) =>
            onChange({ ...value, fee: toFeeDigits(event.currentTarget.value) })
          }
        />
      </div>
    </div>
  );
}
