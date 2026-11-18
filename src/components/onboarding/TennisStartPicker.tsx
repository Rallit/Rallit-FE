import { useId, useState, type MouseEvent } from "react";
import { BottomCTA } from "@/components/BottomCTA";
import { BottomSheet } from "@/components/BottomSheet";
import { NumberWheel } from "@/components/NumberWheel";
import { Select } from "@/components/Select";
import type { TennisStartMonth } from "@/features/onboarding/form";

type TennisStartPickerProps = {
  value: TennisStartMonth | null;
  onChange: (value: TennisStartMonth) => void;
};

const firstYear = 1900;
export function TennisStartPicker({ value, onChange }: TennisStartPickerProps) {
  const labelId = useId();
  const dialogId = useId();
  const [draft, setDraft] = useState<TennisStartMonth | null>(null);
  const [openedAt, setOpenedAt] = useState(() => new Date());
  const currentYear = openedAt.getFullYear();
  const currentMonth = openedAt.getMonth() + 1;
  const monthLimit = draft?.year === currentYear ? currentMonth : 12;

  function open(event: MouseEvent<HTMLButtonElement>) {
    event.currentTarget.focus();
    const now = new Date();
    setOpenedAt(now);
    setDraft(value ?? { year: now.getFullYear(), month: now.getMonth() + 1 });
  }

  function close() {
    setDraft(null);
  }

  return (
    <div className="grid gap-(--spacing-gap-medium)">
      <p
        id={labelId}
        className="typography-label-r-medium m-0 text-(color:--fg-neutral-secondary)"
      >
        테니스 시작 시기
      </p>
      <Select
        aria-describedby={labelId}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-expanded={draft !== null}
        placeholder="시작 연월을 선택해 주세요"
        value={value ? value.year + "년 " + value.month + "월" : undefined}
        onClick={open}
      />
      <BottomSheet
        id={dialogId}
        title="테니스 시작 시기"
        open={draft !== null}
        onDismiss={close}
      >
        {(dismiss) =>
          draft && (
            <>
              <div className="flex gap-(--spacing-gap-small) px-(--spacing-padding-large) py-(--spacing-padding-extra-large)">
                <NumberWheel
                  label="시작 연도"
                  unit="년"
                  first={firstYear}
                  last={currentYear}
                  value={draft.year}
                  onChange={(year) =>
                    setDraft(
                      (previous) =>
                        previous && {
                          year,
                          month: Math.min(
                            previous.month,
                            year === currentYear ? currentMonth : 12,
                          ),
                        },
                    )
                  }
                />
                <NumberWheel
                  label="시작 월"
                  unit="월"
                  first={1}
                  last={monthLimit}
                  value={draft.month}
                  onChange={(month) =>
                    setDraft(
                      (previous) =>
                        previous && {
                          ...previous,
                          month: Math.min(
                            month,
                            previous.year === currentYear ? currentMonth : 12,
                          ),
                        },
                    )
                  }
                />
              </div>
              <BottomCTA
                primaryAction={{
                  children: "확인",
                  onClick: () => dismiss(() => onChange(draft)),
                }}
              />
            </>
          )
        }
      </BottomSheet>
    </div>
  );
}
