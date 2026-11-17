import { useId, useState } from "react";
import { BottomCTA } from "@/components/BottomCTA";
import { BottomSheet } from "@/components/BottomSheet";
import { NumberWheel } from "@/components/NumberWheel";
import { Select } from "@/components/Select";

const LAST_HOUR = 23;
const fields = [
  {
    key: "startHour",
    label: "시작 시간",
    placeholder: "부터",
    suffix: "부터",
    title: "몇 시부터",
  },
  {
    key: "endHour",
    label: "종료 시간",
    placeholder: "까지",
    suffix: "까지",
    title: "몇 시까지",
  },
] as const;

export type MatchRequestTimeRange = {
  startHour: number | null;
  endHour: number | null;
};

type TimePickerProps = {
  value: MatchRequestTimeRange;
  onChange: (value: MatchRequestTimeRange) => void;
};

type Draft = { field: (typeof fields)[number]; hour: number };

export function MatchRequestTimePicker({ value, onChange }: TimePickerProps) {
  const dialogId = useId();
  const [draft, setDraft] = useState<Draft | null>(null);

  const limits = {
    startHour: { first: 0, last: (value.endHour ?? LAST_HOUR) - 1 },
    endHour: { first: (value.startHour ?? 0) + 1, last: LAST_HOUR },
  };
  const close = () => setDraft(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-(--spacing-gap-medium)">
        {fields.map((field) => {
          const hour = value[field.key];
          return (
            <Select
              key={field.key}
              aria-label={
                hour === null
                  ? field.label
                  : `${field.label} ${hour}시${field.suffix}`
              }
              aria-haspopup="dialog"
              aria-controls={dialogId}
              aria-expanded={draft?.field.key === field.key}
              placeholder={field.placeholder}
              value={hour === null ? undefined : `${hour}시${field.suffix}`}
              onClick={(event) => {
                event.currentTarget.focus();
                setDraft({ field, hour: hour ?? limits[field.key].first });
              }}
            />
          );
        })}
      </div>
      <BottomSheet
        id={dialogId}
        title={draft?.field.title ?? ""}
        open={draft !== null}
        onDismiss={close}
        backdrop="overlay"
      >
        {(dismiss) =>
          draft && (
            <>
              <div className="flex px-(--spacing-padding-large) py-(--spacing-padding-small)">
                <NumberWheel
                  label={draft.field.label}
                  unit="시"
                  {...limits[draft.field.key]}
                  value={draft.hour}
                  onChange={(hour) =>
                    setDraft((previous) => previous && { ...previous, hour })
                  }
                />
              </div>
              <BottomCTA
                primaryAction={{
                  children: "확인",
                  onClick: () =>
                    dismiss(() =>
                      onChange({ ...value, [draft.field.key]: draft.hour }),
                    ),
                }}
              />
            </>
          )
        }
      </BottomSheet>
    </>
  );
}
