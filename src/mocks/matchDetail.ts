import type { MatchDetail } from "@/apis/matches.types";

export function createMockMatchDetail(matchId: number): MatchDetail {
  return {
    matchId,
    matchStatus: "RECRUITING",
    matchTypes: ["MENS_DOUBLES"],
    startsAt: "2026-12-23T14:00:00+09:00",
    endsAt: "2026-12-23T16:00:00+09:00",
    participationFee: 20000,
    minNtrp: 3.0,
    maxNtrp: null,
    currentParticipantCount: 2,
    capacity: 4,
    recruitmentDeadline: "2026-12-22T14:00:00+09:00",
    recruitmentOpen: true,
    canApply: true,
    applicationBlockReason: null,
    maleRecruitCount: 2,
    femaleRecruitCount: 0,
    preferredAgeGroups: [],
    court: {
      courtId: 1,
      name: "반포종합운동장 테니스장",
      address: "서울시 동대문구 어쩌구 주소",
      courtNumber: "1",
      latitude: 37.5,
      longitude: 127.0,
      hasParking: true,
      hasShower: true,
      facilityNotes: "지하 3층짜리 주차장 있습니다",
    },
    host: {
      userId: 7,
      nickname: "은구",
      experiencePeriod: "THREE_YEARS_OR_MORE",
      profileImageUrl: null,
    },
  };
}
