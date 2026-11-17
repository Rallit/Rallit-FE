import { useEffect, useId, useMemo, useRef, useState } from "react";
import closeIcon from "../../../assets/icons/close.svg";
import { BottomCTA } from "@/components/BottomCTA";
import { BottomSheet } from "@/components/BottomSheet";
import { Calendar } from "@/components/Calendar";
import { IconButton } from "@/components/IconButton";
import { MatchRequestTimePicker } from "@/components/match-request/MatchRequestTimePicker";
import { Select } from "@/components/Select";
import { TextInputField } from "@/components/TextInputField";
import { UploadZone } from "@/components/UploadZone";
import {
  formatFee,
  getReservableDateRange,
  toFeeDigits,
  type CourtDraft,
} from "@/features/host-match/form";
import { formatMatchDate } from "@/features/match-request/summary";
import { COURTS_MOCK } from "@/mocks/courts";
import { CourtSearchSheet } from "./CourtSearchSheet";

type CourtStepProps = {
  value: CourtDraft;
  onChange: (value: CourtDraft) => void;
  evidence: File | null;
  onEvidenceChange: (file: File | null) => void;
};

const labelStyle =
  "typography-label-r-medium text-(color:--fg-neutral-secondary)";

export function CourtStep({
  value,
  onChange,
  evidence,
  onEvidenceChange,
}: CourtStepProps) {
  const courtSheetId = useId();
  const [courtSheetOpen, setCourtSheetOpen] = useState(false);
  const dateSheetId = useId();
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [dateDraft, setDateDraft] = useState<string | null>(null);
  const dateRange = getReservableDateRange();
  const evidenceInputRef = useRef<HTMLInputElement>(null);
  const evidenceUrl = useMemo(
    () => (evidence ? URL.createObjectURL(evidence) : null),
    [evidence],
  );

  useEffect(
    () => () => {
      if (evidenceUrl) URL.revokeObjectURL(evidenceUrl);
    },
    [evidenceUrl],
  );

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

        <div className="grid min-w-0 flex-1 gap-(--spacing-gap-medium)">
          <p className={`m-0 ${labelStyle}`}>날짜</p>
          <Select
            aria-label="예약 일자 선택"
            aria-haspopup="dialog"
            aria-controls={dateSheetId}
            aria-expanded={dateSheetOpen}
            placeholder="예약일자"
            value={value.date ? formatMatchDate(value.date) : undefined}
            onClick={() => {
              setDateDraft(value.date);
              setDateSheetOpen(true);
            }}
          />
          <BottomSheet
            id={dateSheetId}
            title="예약 일자"
            open={dateSheetOpen}
            onDismiss={() => setDateSheetOpen(false)}
            backdrop="overlay"
          >
            {(dismiss) => (
              <>
                <Calendar
                  value={dateDraft}
                  onChange={setDateDraft}
                  min={dateRange.min}
                  max={dateRange.max}
                />
                <BottomCTA
                  primaryAction={{
                    children: "확인",
                    disabled: dateDraft === null,
                    onClick: () =>
                      dismiss(() => onChange({ ...value, date: dateDraft })),
                  }}
                />
              </>
            )}
          </BottomSheet>
        </div>
      </div>

      <div className="grid gap-(--spacing-gap-medium)">
        <p className={`m-0 ${labelStyle}`}>이용 시간</p>
        <MatchRequestTimePicker
          value={{ startHour: value.startHour, endHour: value.endHour }}
          onChange={(time) => onChange({ ...value, ...time })}
        />
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

      <div className="grid gap-(--spacing-gap-medium)">
        <div className="flex items-center justify-between">
          <p className={`m-0 ${labelStyle}`}>예약 증빙 자료</p>
          <span className="typography-caption-r-medium text-(color:--fg-neutral-subtle)">
            {evidence ? 1 : 0}/1
          </span>
        </div>
        {evidenceUrl ? (
          <div className="relative size-[98px]">
            <img
              src={evidenceUrl}
              alt="예약 증빙 자료 미리보기"
              className="box-border block size-full rounded-(--radius-small) border border-solid border-(--border-neutral-default) object-cover"
            />
            <span className="absolute top-[-9px] left-[76px] grid rounded-(--radius-full) border border-solid border-(--border-neutral-default) bg-(--bg-neutral-default) p-(--spacing-padding-micro)">
              <IconButton
                size="small"
                icon={closeIcon}
                iconColor="var(--fg-neutral-secondary)"
                aria-label="예약 증빙 자료 삭제"
                onClick={() => onEvidenceChange(null)}
                className="-m-3"
              />
            </span>
          </div>
        ) : (
          <UploadZone
            caption="예약 내역 또는 예약 확인 화면을 올려주세요"
            aria-label="예약 증빙 자료 올리기"
            onClick={() => evidenceInputRef.current?.click()}
          />
        )}
        <input
          ref={evidenceInputRef}
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          hidden
          onChange={(event) => {
            const file = event.currentTarget.files?.[0] ?? null;
            event.currentTarget.value = "";
            if (file) onEvidenceChange(file);
          }}
        />
      </div>
    </div>
  );
}
