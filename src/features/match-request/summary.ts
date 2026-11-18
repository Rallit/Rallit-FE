import type { ActivityArea } from "@/apis/locations";
import type { SavedMatchRequest } from "@/apis/matchRequests";
import { MAX_NTRP, matchFormats, type MatchRequest } from "./form";

const weekdayFormat = new Intl.DateTimeFormat("ko-KR", { weekday: "short" });

export function formatMatchDate(date: string, weekdaySeparator = "") {
  const selected = new Date(date + "T00:00:00");
  return `${selected.getMonth() + 1}.${selected.getDate()}${weekdaySeparator}(${weekdayFormat.format(selected)})`;
}

export function formatRequestedNtrp(value: number) {
  return value.toFixed(1) + (value === MAX_NTRP ? "+" : "");
}

export function formatHour(hour: number) {
  return String(hour).padStart(2, "0") + ":00";
}

export function formatMatchTimeRange({
  startHour,
  endHour,
}: Pick<MatchRequest, "startHour" | "endHour">) {
  return `${formatHour(startHour)} - ${formatHour(endHour)}`;
}

export type MatchRequestSummary = Pick<
  MatchRequest,
  "dates" | "activityAreas" | "matchFormats"
> &
  (
    | Pick<MatchRequest, "startHour" | "endHour">
    | {
        startTimeFrom: string;
        startTimeTo: string;
      }
  );

export function toSavedMatchRequestSummary(
  { conditions }: SavedMatchRequest,
  areas: readonly ActivityArea[],
): MatchRequestSummary {
  const { dates, areaCodes, startTimeFrom, startTimeTo, matchTypes } =
    conditions;
  const areaNames = new Map(areas.map(({ id, label }) => [id, label]));
  return {
    dates,
    activityAreas: areaCodes.map((id) => ({
      id,
      label: areaNames.get(id) ?? id,
    })),
    startTimeFrom,
    startTimeTo,
    matchFormats: matchTypes,
  };
}

function formatSummaryTime(request: MatchRequestSummary) {
  return "startTimeFrom" in request
    ? `${request.startTimeFrom} - ${request.startTimeTo}`
    : formatMatchTimeRange(request);
}

export function formatRequestSummary(request: MatchRequestSummary) {
  const [firstDate, ...otherDates] = request.dates;
  const [firstArea, ...otherAreas] = request.activityAreas;

  return [
    formatMatchDate(firstDate) +
      (otherDates.length ? ` 외 ${otherDates.length}` : ""),
    formatSummaryTime(request),
    firstArea.label + (otherAreas.length ? ` 외 ${otherAreas.length}` : ""),
  ];
}

export function formatRequestPreferences(request: MatchRequestSummary) {
  const [firstArea, ...otherAreas] = request.activityAreas;
  const [firstFormat, ...otherFormats] = request.matchFormats;
  const formatLabel =
    matchFormats.find(({ value }) => value === firstFormat)?.label ?? "";

  return [
    formatSummaryTime(request),
    firstArea.label + (otherAreas.length ? ` 외 ${otherAreas.length}` : ""),
    formatLabel + (otherFormats.length ? ` 외 ${otherFormats.length}` : ""),
  ];
}
