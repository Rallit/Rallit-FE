import type { MatchType } from "@/apis/matches.types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const matchTypeLabels: Record<MatchType, string> = {
  SINGLES: "단식",
  RALLY: "랠리",
  MIXED_DOUBLES: "혼합복식",
  WOMENS_DOUBLES: "여자복식",
  MENS_DOUBLES: "남자복식",
};

function toKst(iso: string) {
  const date = new Date(Date.parse(iso) + KST_OFFSET_MS);
  return {
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    weekday: WEEKDAYS[date.getUTCDay()],
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
}

function formatHour({ hour, minute }: { hour: number; minute: number }) {
  return minute === 0 ? `${hour}시` : `${hour}시 ${minute}분`;
}

export function formatMatchStart(iso: string) {
  const time = toKst(iso);
  return `${time.month}.${time.day} (${time.weekday}) ${formatHour(time)}`;
}

export function formatMatchTimeSlot(iso: string) {
  const { weekday, hour } = toKst(iso);
  const day = weekday === "토" || weekday === "일" ? "주말" : "평일";
  return day + (hour < 12 ? " 오전" : " 오후");
}

export function formatDeadline(iso: string) {
  const time = toKst(iso);
  return `${time.month}.${time.day}(${time.weekday}) ${formatHour(time)} 모집 마감`;
}

export function formatMatchTypes(types: readonly MatchType[]) {
  return types.map((type) => matchTypeLabels[type]).join(", ");
}

export function formatNtrpRange(min: number | null, max: number | null) {
  if (min === null && max === null) return "NTRP 무관";
  if (max === null) return `NTRP ${min!.toFixed(1)} 이상`;
  if (min === null) return `NTRP ${max.toFixed(1)} 이하`;
  return `NTRP ${min.toFixed(1)}~${max.toFixed(1)}`;
}

export function formatPrice(fee: number) {
  return `${fee.toLocaleString("ko-KR")}원`;
}

export function formatExperience(years: number | null) {
  if (years === null) return "-";
  return years === 0 ? "1년 미만" : `${years}년`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatMatchDate(iso: string) {
  const time = toKst(iso);
  return `${time.month}.${time.day}(${time.weekday})`;
}

export function formatTimeRange(startIso: string, endIso: string) {
  const start = toKst(startIso);
  const end = toKst(endIso);
  return `${pad(start.hour)}:${pad(start.minute)} - ${pad(end.hour)}:${pad(end.minute)}`;
}
