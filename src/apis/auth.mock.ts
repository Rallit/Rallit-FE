import type { AuthUser } from "./auth.types";

export type MockAuthScenario = "guest" | "new-user" | "existing-user" | "error";

export async function mockStartLogin(
  scenario: "new-user" | "existing-user" | "error" = "new-user",
): Promise<AuthUser> {
  await new Promise<void>((resolve) => setTimeout(resolve, 1000));

  if (scenario === "error") {
    throw new Error("로그인에 실패했습니다. 다시 시도해주세요.");
  }

  return {
    id: 1,
    nickname: "테니스곰123",
    socialDisplayName: "테니스 회원",
    role: "USER",
    onboardingCompleted: scenario === "existing-user",
  };
}

export async function mockGetCurrentUser(
  scenario: MockAuthScenario,
): Promise<AuthUser | null> {
  await new Promise<void>((resolve) => setTimeout(resolve, 500));

  if (scenario === "error") {
    throw new Error("로그인 상태를 확인하지 못했습니다.");
  }

  if (scenario === "guest") {
    return null;
  }

  return {
    id: 1,
    nickname: "테니스곰123",
    socialDisplayName: "테니스 회원",
    role: "USER",
    onboardingCompleted: scenario === "existing-user",
  };
}
