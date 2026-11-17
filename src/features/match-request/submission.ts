import type {
  MatchRequestConditions,
  MatchRequestCreated,
} from "@/apis/matchRequests";
import type { MatchRequest } from "./form";
import { formatHour } from "./summary";

export type MatchRequestCompletion = {
  request: MatchRequest;
  saved: MatchRequestCreated | null;
};

export function toMatchRequestConditions(
  request: MatchRequest,
): MatchRequestConditions {
  return {
    dates: request.dates,
    areaCodes: request.activityAreas.map(({ id }) => id),
    startTimeFrom: formatHour(request.startHour),
    startTimeTo: formatHour(request.endHour),
    matchTypes: request.matchFormats,
    minNtrp: request.ntrp[0],
    maxNtrp: request.ntrp[1],
    sameGenderOnly: request.sameGenderOnly,
  };
}
