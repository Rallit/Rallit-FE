export type AuthTarget = "service" | "admin";

export type AuthUser = {
  id: number;
  nickname: string;
  role: "USER" | "ADMIN";
  onboardingCompleted: boolean;
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
