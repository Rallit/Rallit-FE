import type { MatchRequest } from "./form";

const weekdayFormat = new Intl.DateTimeFormat("ko-KR", { weekday: "short" });

export function formatMatchDate(date: string, weekdaySeparator = "") {
  const selected = new Date(date + "T00:00:00");
  return `${selected.getMonth() + 1}.${selected.getDate()}${weekdaySeparator}(${weekdayFormat.format(selected)})`;
}

function formatHour(hour: number) {
  return String(hour).padStart(2, "0") + ":00";
}

export function formatMatchTimeRange({ startHour, endHour }: MatchRequest) {
  return `${formatHour(startHour)} - ${formatHour(endHour)}`;
}
