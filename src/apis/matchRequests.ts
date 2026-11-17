import { ApiError } from "@/apis/client";
import type { RecommendedMatchesPage } from "@/apis/matches.types";
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

export type MatchRequestResults = {
  hasResults: boolean;
  exactMatches: RecommendedMatchesPage;
  similarMatches: RecommendedMatchesPage;
  relaxedConditions: ("AREA" | "TIME")[];
};

export async function getSavedMatchRequest(
  requestId: number,
  signal: AbortSignal,
) {
  const request = await requestWithAuth<SavedMatchRequest>(
    `/api/v1/match-requests/${requestId}`,
    { signal },
  );
  if (
    request?.requestId !== requestId ||
    !request.conditions?.dates?.length ||
    !request.conditions?.areaCodes?.length
  ) {
    throw new ApiError(
      "protocol",
      "매칭 요청 조회 응답 형식이 올바르지 않습니다.",
    );
  }
  return request;
}

export async function getMatchRequestResults(
  requestId: number,
  signal: AbortSignal,
  {
    exactPage = 0,
    similarPage = 0,
  }: { exactPage?: number; similarPage?: number } = {},
): Promise<MatchRequestResults> {
  const query = new URLSearchParams({
    exactPage: String(exactPage),
    similarPage: String(similarPage),
    size: "6",
  });
  const result = await requestWithAuth<MatchRequestResults>(
    `/api/v1/match-requests/${requestId}/results?${query}`,
    { signal },
  );
  if (
    !Array.isArray(result?.exactMatches?.items) ||
    result.exactMatches.page !== exactPage ||
    typeof result.exactMatches.hasNext !== "boolean" ||
    !Array.isArray(result.similarMatches?.items) ||
    result.similarMatches.page !== similarPage ||
    typeof result.similarMatches.hasNext !== "boolean"
  ) {
    throw new ApiError(
      "protocol",
      "매칭 요청 결과 응답 형식이 올바르지 않습니다.",
    );
  }
  return result;
}

export function deleteMatchRequest(requestId: number, signal: AbortSignal) {
  return requestWithAuth(`/api/v1/match-requests/${requestId}`, {
    method: "DELETE",
    expectResult: false,
    signal,
  });
}
