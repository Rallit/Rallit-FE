import type { RecommendedMatchItem } from "@/apis/matches.types";
import {
  formatMatchStart,
  formatMatchTimeSlot,
  formatMatchTypes,
  formatNtrpRange,
} from "@/features/match-detail/format";

export type RecommendedMatch = {
  id: string;
  dateLabel: string;
  courtName: string;
  courtImagePath: string | null;
  matchType: string;
  skillLevel: string;
  price: number;
  participantCount: number;
  capacity: number;
  tags: readonly string[];
};

export function toRecommendedMatch({
  match,
  areaName,
}: RecommendedMatchItem): RecommendedMatch {
  return {
    id: String(match.matchId),
    dateLabel: formatMatchStart(match.startsAt),
    courtName: match.courtName,
    courtImagePath: match.courtThumbnailUrl,
    matchType: formatMatchTypes(match.matchTypes),
    skillLevel: formatNtrpRange(match.minNtrp, match.maxNtrp),
    price: match.participationFee,
    participantCount: match.currentParticipantCount,
    capacity: match.capacity,
    tags: [formatMatchTimeSlot(match.startsAt), areaName],
  };
}
