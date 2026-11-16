import type { ActivityArea } from "@/apis/locations";
import type { SavedMatchRequest } from "@/apis/matchRequests";
import { MAX_NTRP, type MatchRequest } from "./form";

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
  "dates" | "activityAreas"
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
  const { dates, areaCodes, startTimeFrom, startTimeTo } = conditions;
  const areaNames = new Map(areas.map(({ id, label }) => [id, label]));
  return {
    dates,
    activityAreas: areaCodes.map((id) => ({
      id,
      label: areaNames.get(id) ?? id,
    })),
    startTimeFrom,
    startTimeTo,
  };
}

export function formatRequestSummary(request: MatchRequestSummary) {
  const [firstDate, ...otherDates] = request.dates;
  const [firstArea, ...otherAreas] = request.activityAreas;

  return [
    formatMatchDate(firstDate) +
      (otherDates.length ? ` 외 ${otherDates.length}` : ""),
    "startTimeFrom" in request
      ? `${request.startTimeFrom} - ${request.startTimeTo}`
      : formatMatchTimeRange(request),
    firstArea.label + (otherAreas.length ? ` 외 ${otherAreas.length}` : ""),
  ];
}
