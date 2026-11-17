import { MAX_NTRP, matchFormats, type MatchRequest } from "./form";

const weekdayFormat = new Intl.DateTimeFormat("ko-KR", { weekday: "short" });

export function formatMatchDate(date: string, weekdaySeparator = "") {
  const selected = new Date(date + "T00:00:00");
  return `${selected.getMonth() + 1}.${selected.getDate()}${weekdaySeparator}(${weekdayFormat.format(selected)})`;
}

export function formatRequestedNtrp(value: number) {
  return value.toFixed(1) + (value === MAX_NTRP ? "+" : "");
}

function formatHour(hour: number) {
  return String(hour).padStart(2, "0") + ":00";
}

export function formatMatchTimeRange({ startHour, endHour }: MatchRequest) {
  return `${formatHour(startHour)} - ${formatHour(endHour)}`;
}

export function formatRequestSummary(request: MatchRequest) {
  const [firstDate, ...otherDates] = request.dates;
  const [firstArea, ...otherAreas] = request.activityAreas;

  return [
    formatMatchDate(firstDate) +
      (otherDates.length ? ` 외 ${otherDates.length}` : ""),
    formatMatchTimeRange(request),
    firstArea.label + (otherAreas.length ? ` 외 ${otherAreas.length}` : ""),
  ];
}

export function formatRequestPreferences(request: MatchRequest) {
  const [firstArea, ...otherAreas] = request.activityAreas;
  const [firstFormat, ...otherFormats] = request.matchFormats;
  const formatLabel =
    matchFormats.find(({ value }) => value === firstFormat)?.label ?? "";

  return [
    formatMatchTimeRange(request),
    firstArea.label + (otherAreas.length ? ` 외 ${otherAreas.length}` : ""),
    formatLabel + (otherFormats.length ? ` 외 ${otherFormats.length}` : ""),
  ];
}
