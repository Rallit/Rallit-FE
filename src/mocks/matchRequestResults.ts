import type { ActivityArea } from "@/apis/locations";
import {
  MATCH_REQUEST_RESULT_PAGE_SIZE,
  type MatchRequestResults,
} from "@/apis/matchRequests";
import type {
  RecommendedMatchItem,
  RecommendedMatchesPage,
} from "@/apis/matches.types";
import type { MatchRequest } from "@/features/match-request/form";
import { createMockMatchDetail } from "./matchDetail";

const nearbyAreas = [
  { id: "11170", label: "용산구" },
  { id: "11650", label: "서초구" },
  { id: "11680", label: "강남구" },
  { id: "11200", label: "성동구" },
];

function createPage(
  page: number,
  area: ActivityArea,
  firstId: number,
  count: number,
): RecommendedMatchesPage {
  const size = MATCH_REQUEST_RESULT_PAGE_SIZE;
  const offset = page * size;
  const items = Array.from(
    { length: Math.min(size, Math.max(0, count - offset)) },
    (_, index): RecommendedMatchItem => {
      const {
        court,
        matchId,
        matchStatus,
        matchTypes,
        startsAt,
        endsAt,
        participationFee,
        minNtrp,
        maxNtrp,
        currentParticipantCount,
        capacity,
      } = createMockMatchDetail(firstId + offset + index);
      return {
        match: {
          matchId,
          matchStatus,
          matchTypes,
          startsAt,
          endsAt,
          courtName: court.name,
          participationFee,
          minNtrp,
          maxNtrp,
          currentParticipantCount,
          capacity,
        },
        areaCode: area.id,
        areaName: area.label,
      };
    },
  );
  return {
    items,
    page,
    size,
    hasNext: offset + items.length < count,
    totalElements: count,
  };
}

export function getMockMatchRequestResults(
  request: MatchRequest,
  { exactPage = 0, similarPage = 0 } = {},
): MatchRequestResults {
  const [exactArea] = request.activityAreas;
  const similarArea =
    nearbyAreas.find(({ id }) =>
      request.activityAreas.every((area) => area.id !== id),
    ) ?? nearbyAreas[0];
  return {
    hasResults: true,
    exactMatches: createPage(exactPage, exactArea, 101, 8),
    similarMatches: createPage(similarPage, similarArea, 201, 7),
    relaxedConditions: ["AREA"],
  };
}
