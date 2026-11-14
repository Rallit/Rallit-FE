import type { ActivityArea } from "@/apis/onboarding";

// 로컬에서 충분한 선택지를 제공하여 세 지역 제한을 테스트하기 위한 목 지역 데이터
export const mockActivityAreas: ActivityArea[] = [
  { id: "11110", label: "종로구" },
  { id: "11200", label: "성동구" },
  { id: "11410", label: "서대문구" },
  { id: "11440", label: "마포구" },
];
