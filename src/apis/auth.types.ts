import type { OnboardingProfile } from "./onboarding.types";

export type AuthTarget = "service" | "admin";

export type AuthUser = {
  id: number;
  nickname: string;
  socialDisplayName?: string | null;
  profileImageUrl?: string | null;
  role: "USER" | "ADMIN";
  onboardingCompleted: boolean;
  profile?: OnboardingProfile | null;
};

export type RefreshResult = {
  accessToken: string;
  accessExpiresAt: string;
  sessionExpiresAt: string;
};

export type AuthState =
  | { status: "checking" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "error"; message: string };
