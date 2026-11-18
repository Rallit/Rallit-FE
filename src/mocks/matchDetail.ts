import type { MatchDetail } from "@/apis/matches.types";

export function createMockMatchDetail(matchId: number): MatchDetail {
  const resultFixture =
    (matchId >= 101 && matchId <= 108) || (matchId >= 201 && matchId <= 207);
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
      name: resultFixture
        ? `테스트 코트 ${matchId}`
        : "반포종합운동장 테니스장",
      address: "서울시 동대문구 어쩌구 주소",
      courtNumber: "1",
      latitude: 37.5,
      longitude: 127.0,
      hasParking: true,
      hasShower: true,
      facilityNotes: "입장 시 예약 내역을 보여주세요.",
      facilities: [
        { type: "PARKING", note: "지하 3층 주차장" },
        { type: "SHOWER", note: "남녀 샤워실 각 1개" },
      ],
      thumbnailUrl: null,
    },
    host: {
      userId: 7,
      nickname: "은구",
      experienceYears: 3,
      profileImageUrl: null,
    },
  };
}
