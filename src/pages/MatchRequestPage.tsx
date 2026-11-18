import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "@/apis/client";
import { createMatchRequest } from "@/apis/matchRequests";
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
  LAST_REQUEST_HOUR,
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
import { formatRequestedNtrp } from "@/features/match-request/summary";
import {
  toMatchRequestConditions,
  type MatchRequestCompletion,
} from "@/features/match-request/submission";
import { useAuthContext } from "@/hooks/useAuthContext";
import { authMode } from "@/platform/authConfig.web";

const DATE_WINDOW_DAYS = 14;
const HOUR_MS = 60 * 60 * 1000;
const SEOUL_OFFSET_MS = 9 * HOUR_MS;
const PAST_START_MESSAGE =
  "오늘만 선택한 매칭 요청은 현재 시각보다 늦은 시작 시각을 선택해 주세요.";

const monthFormat = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  timeZone: "UTC",
});
const weekdayFormat = new Intl.DateTimeFormat("ko-KR", {
  weekday: "short",
  timeZone: "UTC",
});
const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "long",
  timeZone: "UTC",
});
const fieldLabel =
  "typography-label-r-medium m-0 p-0 text-(color:--fg-neutral-secondary)";

function getSeoulHour(now: Date) {
  return new Date(now.getTime() + SEOUL_OFFSET_MS).getUTCHours();
}

function getCalendar(now: Date) {
  const today = new Date(now.getTime() + SEOUL_OFFSET_MS);
  const dates = Array.from(
    { length: DATE_WINDOW_DAYS },
    (_, offset) =>
      new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate() + offset,
        ),
      ),
  );
  const days = dates.map((date, offset) => {
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return {
      id: `${date.getUTCFullYear()}-${month}-${day}`,
      day: date.getUTCDate(),
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
  const inFlight = useRef<AbortController | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [seoulHour, setSeoulHour] = useState(() => getSeoulHour(new Date()));
  const [submitError, setSubmitError] = useState<string>();
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
      setSeoulHour(getSeoulHour(now));
      timer = window.setTimeout(
        syncCalendar,
        HOUR_MS - (now.getTime() % HOUR_MS),
      );
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") syncCalendar();
    }

    syncCalendar();
    window.addEventListener("focus", syncCalendar);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      inFlight.current?.abort();
      window.clearTimeout(timer);
      window.removeEventListener("focus", syncCalendar);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshCalendar]);

  const todayOnly =
    selectedDates.length === 1 && selectedDates[0] === days[0].id;
  const minStartHour = todayOnly ? seoulHour + 1 : 0;
  const hasTimeLeft = minStartHour < LAST_REQUEST_HOUR;
  const availableTimeRange = {
    startHour:
      timeRange.startHour !== null && timeRange.startHour >= minStartHour
        ? timeRange.startHour
        : null,
    endHour:
      timeRange.endHour !== null && timeRange.endHour > minStartHour
        ? timeRange.endHour
        : null,
  };
  const request = getMatchRequest({
    dates: selectedDates,
    ...availableTimeRange,
    activityAreas,
    matchFormats: selectedFormats,
    sameGenderOnly,
    ntrp,
  });

  async function submitRequest() {
    if (!request || authState.status !== "authenticated" || inFlight.current)
      return;
    setSubmitError(undefined);

    const now = new Date();
    const availableDates = refreshCalendar(now);
    if (request.dates.some((date) => !availableDates.has(date))) {
      setSubmitError(
        "선택할 수 있는 날짜가 바뀌었어요. 희망 일시를 다시 확인해 주세요.",
      );
      return;
    }

    const [today] = availableDates;
    if (
      request.dates.length === 1 &&
      request.dates[0] === today &&
      request.startHour <= getSeoulHour(now)
    ) {
      setSeoulHour(getSeoulHour(now));
      setSubmitError(PAST_START_MESSAGE);
      return;
    }

    if (authMode === "mock") {
      storeMatchRequest(authState.user.id, request);
      const state: MatchRequestCompletion = { request, saved: null };
      void navigate(MATCH_REQUEST_COMPLETE_PATH, { state, replace: true });
      return;
    }

    const controller = new AbortController();
    inFlight.current = controller;
    setSubmitting(true);
    try {
      const saved = await createMatchRequest(
        toMatchRequestConditions(request),
        controller.signal,
      );
      if (!controller.signal.aborted) {
        const state: MatchRequestCompletion = { request, saved };
        void navigate(MATCH_REQUEST_COMPLETE_PATH, { state, replace: true });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setSubmitError(
          error instanceof ApiError && error.kind === "api"
            ? error.message
            : "매칭 요청을 저장하지 못했어요. 다시 시도해 주세요.",
        );
      }
    } finally {
      inFlight.current = null;
      if (!controller.signal.aborted) setSubmitting(false);
    }
  }

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
          {submitError && (
            <p
              role="alert"
              className="typography-label-r-medium mx-0 mt-0 mb-2 text-(color:--fg-neutral-default)"
            >
              {submitError}
            </p>
          )}
          <ActionButton
            size="M"
            fullWidth
            disabled={request === null || submitting}
            aria-busy={submitting}
            onClick={() => void submitRequest()}
          >
            {submitting ? "저장 중" : "매칭 신청하기"}
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
            <div className="grid gap-(--spacing-gap-small)">
              <MatchRequestTimePicker
                value={availableTimeRange}
                onChange={setTimeRange}
                minStartHour={minStartHour}
              />
              {!hasTimeLeft && (
                <p className="typography-label-r-medium m-0 text-(color:--fg-neutral-tertiary)">
                  오늘 선택할 수 있는 시간이 없어요. 다른 날짜를 선택해 주세요.
                </p>
              )}
            </div>
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
          <legend className={fieldLabel}>희망 매치 유형</legend>
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
              formatValue={formatRequestedNtrp}
            />
          </div>
        </fieldset>
      </div>
    </PageLayout>
  );
}
