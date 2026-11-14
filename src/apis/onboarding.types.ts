export type ExperiencePeriod =
  | "UNDER_SIX_MONTHS"
  | "SIX_MONTHS_TO_ONE_YEAR"
  | "ONE_TO_THREE_YEARS"
  | "THREE_YEARS_OR_MORE";

export type OnboardingProfile = {
  gender: "MALE" | "FEMALE";
  ageGroup:
    | "TEENS"
    | "TWENTIES"
    | "THIRTIES"
    | "FORTIES"
    | "FIFTIES"
    | "SIXTIES_OR_OLDER";
  experiencePeriod: ExperiencePeriod;
  ntrp: "1.0" | "1.5" | "2.0" | "2.5" | "3.0" | "3.5" | "4.0+";
  sameGenderOnly: boolean;
  preferredMatchTypes: ("SINGLES" | "RALLY" | "DOUBLES" | "MIXED_DOUBLES")[];
  activityAreaCodes: string[];
  preferredTimeSlots: (
    | "WEEKDAY_MORNING"
    | "WEEKDAY_AFTERNOON"
    | "WEEKEND_MORNING"
    | "WEEKEND_AFTERNOON"
  )[];
};

export type OnboardingRequest = OnboardingProfile & { nickname: string };
