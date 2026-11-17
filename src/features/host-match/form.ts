import type { OnboardingProfile } from "@/apis/onboarding.types";
import type { MatchFormat } from "@/features/match-request/form";

export const HOST_MATCH_NEW_PATH = "/host/matches/new";
export const HOST_MATCH_PREVIEW_PATH = "/host/matches/preview";

export type HostMatchPreviewSummary = {
  courtName: string;
  dateTimeLabel: string;
  current: number;
  capacity: number;
  status: "recruiting" | "confirmed";
};

export type MatchInfoDraft = {
  matchFormat: MatchFormat | null;
  sameGenderOnly: boolean;
  maleRecruitCount: number;
  femaleRecruitCount: number;
  ntrp: readonly [minimum: number, maximum: number];
  preferredAgeGroups: OnboardingProfile["ageGroup"][];
  anyAgeGroup: boolean;
  fee: string;
};

// 04-A 코트 등록 입력값. 코트 API 확정 전까지 courtId 형식은 임시입니다.
export type CourtDraft = {
  courtId: number | null;
  courtName: string;
  courtNumber: string;
  date: string | null;
  startHour: number | null;
  endHour: number | null;
  fee: string;
};

export const initialCourtDraft: CourtDraft = {
  courtId: null,
  courtName: "",
  courtNumber: "",
  date: null,
  startHour: null,
  endHour: null,
  fee: "",
};

export function isCourtDraftReady(draft: CourtDraft) {
  return (
    draft.courtId !== null &&
    draft.courtNumber.trim() !== "" &&
    draft.date !== null &&
    draft.startHour !== null &&
    draft.endHour !== null &&
    draft.fee.trim() !== ""
  );
}

export function toFeeDigits(input: string) {
  return input.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

export function formatFee(fee: string) {
  return fee ? BigInt(fee).toLocaleString("ko-KR") : "";
}

// 코트 목록 API 확정 전 임시 형태입니다.
export type CourtOption = {
  id: number;
  name: string;
  address: string;
  imageUrl: string | null;
};

const hangulInitials = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

export function searchCourts(courts: readonly CourtOption[], keyword: string) {
  const query = keyword.trim();
  if (!query) return courts;

  const compactQuery = query.replace(/\s/g, "");
  if (
    !Array.from(compactQuery).every((letter) => hangulInitials.includes(letter))
  ) {
    return courts.filter(({ name }) => name.includes(query));
  }

  return courts.filter(({ name }) => {
    const initials = name
      .normalize("NFC")
      .replace(/\s/g, "")
      .replace(/[가-힣]/g, (syllable) =>
        hangulInitials.charAt(
          Math.floor((syllable.charCodeAt(0) - 0xac00) / 588),
        ),
      );
    return initials.includes(compactQuery);
  });
}

export const RESERVABLE_DAYS = 14;

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// 오늘부터 2주(오늘 + 14일)까지 예약 일자로 선택할 수 있습니다.
export function getReservableDateRange(today = new Date()) {
  const last = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + RESERVABLE_DAYS,
  );
  return { min: toDateKey(today), max: toDateKey(last) };
}
