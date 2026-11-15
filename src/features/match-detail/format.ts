import type { MatchType } from "@/apis/matches.types";
import type { ExperiencePeriod } from "@/apis/onboarding.types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const matchTypeLabels: Record<MatchType, string> = {
  SINGLES: "단식",
  RALLY: "랠리",
  MIXED_DOUBLES: "혼합복식",
  WOMENS_DOUBLES: "여자복식",
  MENS_DOUBLES: "남자복식",
};

const experienceLabels: Record<ExperiencePeriod, string> = {
  UNDER_SIX_MONTHS: "6개월 미만",
  SIX_MONTHS_TO_ONE_YEAR: "6개월~1년",
  ONE_TO_THREE_YEARS: "1~3년",
  THREE_YEARS_OR_MORE: "3년 이상",
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

export function formatExperience(period: ExperiencePeriod | null) {
  return period ? experienceLabels[period] : "-";
}
