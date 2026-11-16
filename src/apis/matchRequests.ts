import { ApiError } from "@/apis/client";
import type { MatchFormat } from "@/features/match-request/form";
import { requestWithAuth } from "@/services/authSession";

export type MatchRequestConditions = {
  dates: string[];
  areaCodes: string[];
  startTimeFrom: string;
  startTimeTo: string;
  matchTypes: MatchFormat[];
  minNtrp: number;
  maxNtrp: number;
  sameGenderOnly: boolean;
};

export type SavedMatchRequest = {
  requestId: number;
  conditions: MatchRequestConditions;
  expiresAt: string;
};

export type MatchRequestCreated = {
  request: SavedMatchRequest;
  exactMatchCount: number;
  hasResults: boolean;
};

export async function createMatchRequest(
  conditions: MatchRequestConditions,
  signal: AbortSignal,
): Promise<MatchRequestCreated> {
  const result = await requestWithAuth<MatchRequestCreated>(
    "/api/v1/match-requests",
    { method: "POST", json: conditions, signal },
  );

  if (
    !Number.isSafeInteger(result?.request?.requestId) ||
    result.request.requestId <= 0 ||
    !Number.isSafeInteger(result.exactMatchCount) ||
    result.exactMatchCount < 0 ||
    typeof result.hasResults !== "boolean"
  ) {
    throw new ApiError(
      "protocol",
      "매칭 요청 저장 응답 형식이 올바르지 않습니다.",
    );
  }

  return result;
}

export async function getSavedMatchRequests(
  signal: AbortSignal,
): Promise<SavedMatchRequest[]> {
  const requests = await requestWithAuth<SavedMatchRequest[]>(
    "/api/v1/match-requests",
    { signal },
  );
  if (!Array.isArray(requests)) {
    throw new ApiError(
      "protocol",
      "매칭 요청 목록 응답 형식이 올바르지 않습니다.",
    );
  }
  return requests;
}
