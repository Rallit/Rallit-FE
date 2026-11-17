import type { OnboardingProfile } from "@/apis/onboarding.types";

export type MatchType =
  "SINGLES" | "RALLY" | "MIXED_DOUBLES" | "WOMENS_DOUBLES" | "MENS_DOUBLES";

export type MatchStatus =
  "PENDING_APPROVAL" | "RECRUITING" | "CONFIRMED" | "COMPLETED" | "CANCELED";

export type ApplicationBlockReason =
  | "MATCH_RECRUITMENT_CLOSED"
  | "HOST_NOT_ALLOWED"
  | "GENDER_NOT_RECRUITED"
  | "RECRUITMENT_FULL"
  | "APPLICATION_DUPLICATED";

export type ApplicationStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELED"
  | "EXPIRED";

export type MatchCourt = {
  courtId: number;
  name: string;
  address: string;
  courtNumber: string;
  latitude: number;
  longitude: number;
  hasParking: boolean;
  hasShower: boolean;
  facilityNotes: string | null;
  thumbnailUrl: string | null;
};

export type MatchHost = {
  userId: number;
  nickname: string;
  experienceYears: number | null;
  profileImageUrl: string | null;
};

export type MatchDetail = {
  matchId: number;
  matchStatus: MatchStatus;
  matchTypes: MatchType[];
  startsAt: string;
  endsAt: string;
  participationFee: number;
  minNtrp: number | null;
  maxNtrp: number | null;
  currentParticipantCount: number;
  capacity: number;
  recruitmentDeadline: string;
  recruitmentOpen: boolean;
  canApply: boolean;
  applicationBlockReason: ApplicationBlockReason | null;
  maleRecruitCount: number;
  femaleRecruitCount: number;
  preferredAgeGroups: OnboardingProfile["ageGroup"][];
  court: MatchCourt;
  host: MatchHost;
};

export type RecommendedMatchItem = {
  match: Pick<
    MatchDetail,
    | "matchId"
    | "matchStatus"
    | "matchTypes"
    | "startsAt"
    | "endsAt"
    | "participationFee"
    | "minNtrp"
    | "maxNtrp"
    | "currentParticipantCount"
    | "capacity"
  > & { courtName: string };
  areaCode: string;
  areaName: string;
};

export type RecommendedMatchesPage = {
  items: RecommendedMatchItem[];
  page: number;
  size: number;
  hasNext: boolean;
  totalElements: number;
};

export type MatchApplication = {
  applicationId: number;
  matchId: number;
  status: ApplicationStatus;
  appliedAt: string;
};
