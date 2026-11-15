import type { MatchApplication, MatchDetail } from "@/apis/matches.types";
import { ApiError } from "@/apis/client";
import { authMode } from "@/platform/authConfig.web";
import { requestWithAuth } from "@/services/authSession";

export async function getMatchDetail(
  matchId: number,
  signal: AbortSignal,
): Promise<MatchDetail> {
  if (import.meta.env.DEV && authMode === "mock") {
    const { createMockMatchDetail } = await import("@/mocks/matchDetail");
    signal.throwIfAborted();
    return createMockMatchDetail(matchId);
  }

  const detail = await requestWithAuth<MatchDetail>(
    `/api/v1/matches/${matchId}`,
    { signal },
  );
  if (detail?.matchId !== matchId) {
    throw new ApiError("protocol", "매치 상세 응답 형식이 올바르지 않습니다.");
  }
  return detail;
}

export async function applyToMatch(
  matchId: number,
  signal: AbortSignal,
): Promise<MatchApplication> {
  if (import.meta.env.DEV && authMode === "mock") {
    signal.throwIfAborted();
    return {
      applicationId: 1,
      matchId,
      status: "PENDING",
      appliedAt: new Date().toISOString(),
    };
  }

  const application = await requestWithAuth<MatchApplication>(
    `/api/v1/matches/${matchId}/applications`,
    { method: "POST", json: { refundPolicyAgreed: true }, signal },
  );
  if (application?.matchId !== matchId || application.status !== "PENDING") {
    throw new ApiError("protocol", "참가 신청 응답을 확인하지 못했습니다.");
  }
  return application;
}
