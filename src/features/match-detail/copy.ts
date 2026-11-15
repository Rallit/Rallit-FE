import type { ApplicationBlockReason } from "@/apis/matches.types";

// 임시 문구: 환불 규정은 기획 확정 전, 시안 문구를 사용합니다.
export const REFUND_POLICY = [
  "경기 3일 전까지: 전액 환불",
  "3일 전 ~ 당일: 50% 환불",
];
export const FREE_CANCEL_NOTICE =
  "호스트 수락 전에는 언제든 무료로 취소할 수 있어요.";
export const APPLIED_TOAST = "호스트가 수락하면 알려드릴게요";

// 임시 문구: 신청 불가 사유별 버튼 문구는 디자인 확정 전
export const applicationBlockLabels: Record<ApplicationBlockReason, string> = {
  MATCH_RECRUITMENT_CLOSED: "모집 마감",
  HOST_NOT_ALLOWED: "내가 연 매치",
  GENDER_NOT_RECRUITED: "모집 성별이 아니에요",
  RECRUITMENT_FULL: "모집 인원 마감",
  APPLICATION_DUPLICATED: "수락 대기중",
};
