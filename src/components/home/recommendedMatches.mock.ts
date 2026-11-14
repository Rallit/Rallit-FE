export type RecommendedMatch = {
  id: string;
  dateLabel: string;
  courtName: string;
  matchType: string;
  skillLevel: string;
  price: number;
  participantCount: number;
  capacity: number;
  tags: readonly string[];
};

// 추천 API 수령 전 임시 데이터
export const RECOMMENDED_MATCHES_MOCK: readonly RecommendedMatch[] = Array.from(
  { length: 5 },
  (_, index) => ({
    id: `mock-${index + 1}`,
    dateLabel: "12.23 (토) 14시",
    courtName: `반포종합운동장 테니스장 ${index + 1}코트`,
    matchType: "남자복식",
    skillLevel: "NTRP 3.0 이상",
    price: 20000,
    participantCount: 2,
    capacity: 4,
    tags: ["주말 오전", "서초구"],
  }),
);
