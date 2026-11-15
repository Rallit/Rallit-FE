import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { ActivityArea } from "@/apis/locations";
import { ActionButton } from "@/components/ActionButton";
import { ActivityAreaPicker } from "@/components/ActivityAreaPicker";
import { Checkbox } from "@/components/Checkbox";
import { DaySelector } from "@/components/DaySelector";
import { Header } from "@/components/Header";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  MatchRequestTimePicker,
  type MatchRequestTimeRange,
} from "@/components/match-request/MatchRequestTimePicker";
import { RangeSlider, type RangeSliderValue } from "@/components/RangeSlider";
import { SelectionChip } from "@/components/SelectionChip";
import {
  MATCH_REQUEST_COMPLETE_PATH,
  MAX_NTRP,
  MAX_REQUEST_AREAS,
  MIN_NTRP,
  NTRP_STEP,
  getMatchRequest,
  matchFormats,
  type MatchFormat,
} from "@/features/match-request/form";
import { storeMatchRequest } from "@/features/match-request/storage.web";
import { useAuthContext } from "@/hooks/useAuthContext";

const DATE_WINDOW_DAYS = 14;

const monthFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
});
const weekdayFormat = new Intl.DateTimeFormat("ko-KR", { weekday: "short" });
const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "long",
});
const fieldLabel =
  "typography-label-r-medium m-0 p-0 text-(color:--fg-neutral-secondary)";

function getCalendar(today: Date) {
  const dates = Array.from(
    { length: DATE_WINDOW_DAYS },
    (_, offset) =>
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset),
  );
  const days = dates.map((date, offset) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return {
      id: `${date.getFullYear()}-${month}-${day}`,
      day: date.getDate(),
      weekday: weekdayFormat.format(date),
      accessibleLabel: dateFormat.format(date),
      today: offset === 0,
    };
  });

  return {
    days,
    monthLabel: monthFormat.formatRange(today, dates.at(-1) ?? today),
  };
}

function toggleSelection<T>(selected: readonly T[], value: T) {
  return selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value];
}

export default function MatchRequestPage() {
  const navigate = useNavigate();
  const { authState } = useAuthContext();
  const [{ days, monthLabel }, setCalendar] = useState(() =>
    getCalendar(new Date()),
  );
  const [selectedDates, setSelectedDates] = useState(() =>
    days.filter((day) => day.today).map((day) => day.id),
  );
  const [timeRange, setTimeRange] = useState<MatchRequestTimeRange>({
    startHour: null,
    endHour: null,
  });
  const [activityAreas, setActivityAreas] = useState<ActivityArea[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<MatchFormat[]>([]);
  const [sameGenderOnly, setSameGenderOnly] = useState(false);
  const [ntrp, setNtrp] = useState<RangeSliderValue>([1, 2]);
  const refreshCalendar = useCallback((now: Date) => {
    const calendar = getCalendar(now);
    const availableDates = new Set(calendar.days.map(({ id }) => id));

    setCalendar((previous) =>
      previous.days[0].id === calendar.days[0].id ? previous : calendar,
    );
    setSelectedDates((previous) =>
      previous.every((date) => availableDates.has(date))
        ? previous
        : previous.filter((date) => availableDates.has(date)),
    );

    return availableDates;
  }, []);

  useEffect(() => {
    let timer: number;

    function syncCalendar() {
      window.clearTimeout(timer);
      const now = new Date();
      refreshCalendar(now);
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );
      timer = window.setTimeout(
        syncCalendar,
        nextMidnight.getTime() - now.getTime(),
      );
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") syncCalendar();
    }

    syncCalendar();
    window.addEventListener("focus", syncCalendar);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", syncCalendar);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshCalendar]);

  const request = getMatchRequest({
    dates: selectedDates,
    ...timeRange,
    activityAreas,
    matchFormats: selectedFormats,
    sameGenderOnly,
    ntrp,
  });

  return (
    <PageLayout
      header={
        <Header
          variant="subpage"
          title="원하는 매치 찾기"
          onBack={() => void navigate("/")}
        />
      }
      footer={
        <div className="px-(--spacing-padding-large) py-(--spacing-padding-medium)">
          <ActionButton
            size="M"
            fullWidth
            disabled={request === null}
            onClick={() => {
              if (!request || authState.status !== "authenticated") return;

              const availableDates = refreshCalendar(new Date());
              if (request.dates.some((date) => !availableDates.has(date)))
                return;

              storeMatchRequest(authState.user.id, request);
              void navigate(MATCH_REQUEST_COMPLETE_PATH, {
                state: request,
                replace: true,
              });
            }}
          >
            매칭 신청하기
          </ActionButton>
        </div>
      }
    >
      <div className="grid gap-(--spacing-gap-extra-large) pt-5 pb-12">
        <div className="grid gap-(--spacing-gap-micro)">
          <p className="typography-heading-bold m-0">매치를 찾아드려요</p>
          <p className="typography-body-medium m-0 text-(color:--fg-neutral-tertiary)">
            기입한 정보를 바탕으로 추천 소식을 보내드릴게요
          </p>
        </div>

        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className={fieldLabel}>희망 일시</legend>
          <div className="mt-(--spacing-gap-medium) grid gap-(--spacing-gap-large)">
            <DaySelector
              monthLabel={monthLabel}
              days={days}
              selectedIds={selectedDates}
              onSelect={(date) =>
                setSelectedDates((selected) => toggleSelection(selected, date))
              }
            />
            <MatchRequestTimePicker value={timeRange} onChange={setTimeRange} />
          </div>
        </fieldset>

        <ActivityAreaPicker
          label="희망 지역"
          title="희망 지역"
          maxAreas={MAX_REQUEST_AREAS}
          backdrop="overlay"
          value={activityAreas}
          onChange={setActivityAreas}
        />

        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className={fieldLabel}>희망 방식</legend>
          <div className="mt-(--spacing-gap-medium) flex flex-wrap gap-(--spacing-gap-small)">
            {matchFormats.map(({ value, label }) => (
              <SelectionChip
                key={value}
                label={label}
                selected={selectedFormats.includes(value)}
                disabled={sameGenderOnly && value === "MIXED_DOUBLES"}
                onClick={() =>
                  setSelectedFormats((selected) =>
                    toggleSelection(selected, value),
                  )
                }
              />
            ))}
          </div>
          <label className="typography-label-l-medium mt-(--spacing-gap-medium) flex w-fit cursor-pointer items-center gap-(--spacing-gap-micro) text-(color:--fg-neutral-subtle) has-disabled:cursor-default">
            <Checkbox
              checked={sameGenderOnly}
              disabled={selectedFormats.includes("MIXED_DOUBLES")}
              onChange={(event) =>
                setSameGenderOnly(event.currentTarget.checked)
              }
            />
            동성만
          </label>
        </fieldset>

        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className={fieldLabel}>희망 플레이어 실력</legend>
          <div className="mt-(--spacing-gap-medium)">
            <RangeSlider
              min={MIN_NTRP}
              max={MAX_NTRP}
              step={NTRP_STEP}
              value={ntrp}
              onChange={setNtrp}
              minLabel="최소 NTRP"
              maxLabel="최대 NTRP"
              formatValue={(value) =>
                value === MAX_NTRP ? "4.5+" : value.toFixed(1)
              }
            />
          </div>
        </fieldset>
      </div>
    </PageLayout>
  );
}
