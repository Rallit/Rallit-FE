import type { MatchFormat } from "@/features/match-request/form";

export const HOST_MATCH_NEW_PATH = "/host/matches/new";

export type MatchInfoDraft = {
  matchFormat: MatchFormat | null;
  sameGenderOnly: boolean;
  maleRecruitCount: number;
  femaleRecruitCount: number;
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
