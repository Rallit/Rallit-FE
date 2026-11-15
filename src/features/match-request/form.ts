import type { ActivityArea } from "@/apis/locations";

export const MATCH_REQUEST_PATH = "/match-requests/new";
export const MATCH_REQUEST_COMPLETE_PATH = "/match-requests/complete";
export const MATCH_REQUEST_RESULTS_PATH = "/match-requests/results";
export const MAX_REQUEST_AREAS = 3;
export const MIN_NTRP = 1;
export const MAX_NTRP = 4.5;
export const NTRP_STEP = 0.5;

export const matchFormats = [
  { value: "SINGLES", label: "단식" },
  { value: "RALLY", label: "랠리" },
  { value: "DOUBLES", label: "복식" },
  { value: "MIXED_DOUBLES", label: "혼합복식" },
] as const;

export type MatchFormat = (typeof matchFormats)[number]["value"];

type MatchRequestDraft = {
  dates: string[];
  startHour: number | null;
  endHour: number | null;
  activityAreas: ActivityArea[];
  matchFormats: MatchFormat[];
  sameGenderOnly: boolean;
  ntrp: readonly [minimum: number, maximum: number];
};

export type MatchRequest = MatchRequestDraft & {
  startHour: number;
  endHour: number;
};

function isNtrpLevel(value: number) {
  return (
    value >= MIN_NTRP &&
    value <= MAX_NTRP &&
    Number.isInteger((value - MIN_NTRP) / NTRP_STEP)
  );
}

export function getMatchRequest(draft: MatchRequestDraft): MatchRequest | null {
  const {
    dates,
    startHour,
    endHour,
    activityAreas,
    matchFormats,
    sameGenderOnly,
    ntrp: [minNtrp, maxNtrp],
  } = draft;

  if (
    dates.length === 0 ||
    startHour === null ||
    endHour === null ||
    !Number.isInteger(startHour) ||
    !Number.isInteger(endHour) ||
    startHour < 0 ||
    endHour > 23 ||
    startHour >= endHour ||
    activityAreas.length === 0 ||
    activityAreas.length > MAX_REQUEST_AREAS ||
    matchFormats.length === 0 ||
    (sameGenderOnly && matchFormats.includes("MIXED_DOUBLES")) ||
    !isNtrpLevel(minNtrp) ||
    !isNtrpLevel(maxNtrp) ||
    minNtrp > maxNtrp
  ) {
    return null;
  }

  return { ...draft, startHour, endHour, dates: dates.toSorted() };
}
