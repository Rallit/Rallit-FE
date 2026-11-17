import { useId, useState } from "react";
import { Select } from "@/components/Select";
import { TextInputField } from "@/components/TextInputField";
import {
  formatFee,
  toFeeDigits,
  type CourtDraft,
} from "@/features/host-match/form";
import { COURTS_MOCK } from "@/mocks/courts";
import { CourtSearchSheet } from "./CourtSearchSheet";

type CourtStepProps = {
  value: CourtDraft;
  onChange: (value: CourtDraft) => void;
};

const labelStyle =
  "typography-label-r-medium text-(color:--fg-neutral-secondary)";

export function CourtStep({ value, onChange }: CourtStepProps) {
  const courtSheetId = useId();
  const [courtSheetOpen, setCourtSheetOpen] = useState(false);

  return (
    <div className="mt-(--spacing-gap-extra-large) grid gap-(--spacing-gap-extra-large) pb-(--spacing-padding-large)">
      <div className="grid gap-(--spacing-gap-medium)">
        <p className={`m-0 ${labelStyle}`}>코트</p>
        <Select
          aria-label="코트 선택"
          aria-haspopup="dialog"
          aria-controls={courtSheetId}
          aria-expanded={courtSheetOpen}
          placeholder="예약한 코트를 선택해주세요"
          value={value.courtName || undefined}
          onClick={() => setCourtSheetOpen(true)}
        />
        <CourtSearchSheet
          id={courtSheetId}
          open={courtSheetOpen}
          courts={COURTS_MOCK}
          onSelect={(court) =>
            onChange({ ...value, courtId: court.id, courtName: court.name })
          }
          onDismiss={() => setCourtSheetOpen(false)}
        />
      </div>

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
