import type { ActivityArea } from "@/apis/locations";
import type { OnboardingRequest } from "@/apis/onboarding.types";

export type BasicProfileDraft = {
  nickname: string;
  gender: OnboardingRequest["gender"] | null;
  ageGroup: OnboardingRequest["ageGroup"] | null;
};

export type TennisStartMonth = { year: number; month: number };

export type SkillDraft = {
  tennisStart: TennisStartMonth | null;
  ntrp: OnboardingRequest["ntrp"];
};

export type MatchPreferencesDraft = Pick<
  OnboardingRequest,
  "sameGenderOnly" | "preferredMatchTypes" | "preferredTimeSlots"
> & {
  activityAreas: ActivityArea[];
};

export const maxActivityAreas = 3;
export const nicknameMaxLength = 12;

export type OnboardingFieldError = { step: number; message: string };

const fieldsByStep = [
  ["nickname", "gender", "ageGroup"],
  ["tennisStartedOn", "ntrp"],
  [
    "preferredMatchTypes",
    "sameGenderOnly",
    "activityAreaCodes",
    "preferredTimeSlots",
  ],
] as const satisfies readonly (readonly (keyof OnboardingRequest)[])[];

export function isMatchPreferencesReady(preferences: MatchPreferencesDraft) {
  return (
    preferences.preferredMatchTypes.length > 0 &&
    preferences.activityAreas.length > 0 &&
    preferences.activityAreas.length <= maxActivityAreas &&
    !(
      preferences.sameGenderOnly &&
      preferences.preferredMatchTypes.includes("MIXED_DOUBLES")
    ) &&
    preferences.preferredTimeSlots.length > 0
  );
}

function formatTennisStartedOn({ year, month }: TennisStartMonth) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function buildOnboardingRequest(
  { nickname, gender, ageGroup }: BasicProfileDraft,
  { tennisStart, ntrp }: SkillDraft,
  preferences: MatchPreferencesDraft,
): OnboardingRequest | null {
  if (
    !gender ||
    !ageGroup ||
    !tennisStart ||
    !isMatchPreferencesReady(preferences)
  )
    return null;

  return {
    nickname,
    gender,
    ageGroup,
    tennisStartedOn: formatTennisStartedOn(tennisStart),
    ntrp,
    sameGenderOnly: preferences.sameGenderOnly,
    preferredMatchTypes: preferences.preferredMatchTypes,
    activityAreaCodes: preferences.activityAreas.map(({ id }) => id),
    preferredTimeSlots: preferences.preferredTimeSlots,
  };
}

export function getOnboardingFieldError(
  result: unknown,
): OnboardingFieldError | undefined {
  if (!result || typeof result !== "object") return;
  const messages = result as Record<string, unknown>;

  for (const [step, fields] of fieldsByStep.entries()) {
    for (const field of fields) {
      const message = messages[field];
      if (typeof message === "string" && message.trim())
        return { step, message };
    }
  }
}
