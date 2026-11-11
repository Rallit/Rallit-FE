// 프론트 흐름 검증용 타입입니다.
// 실제 백엔드 응답 명세가 나오면 맞춰 연결합니다.
export type AuthUser = {
  id: number;
  nickname: string;
  onboardingCompleted: boolean;
};

export type AuthState =
  | { status: "checking" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "error"; message: string };
