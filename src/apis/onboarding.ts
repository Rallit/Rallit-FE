import type { AuthUser } from "@/apis/auth.types";
import type { OnboardingRequest } from "@/apis/onboarding.types";
import { ApiError } from "@/apis/client";
import { mockActivityAreas } from "@/apis/onboarding.mock";
import { authMode } from "@/platform/authConfig.web";
import { requestWithAuth } from "@/services/authSession";

export async function checkNicknameAvailability(
  nickname: string,
  signal: AbortSignal,
): Promise<boolean> {
  if (authMode === "mock") {
    signal.throwIfAborted();
    return nickname !== "테니스조아";
  }

  const query = new URLSearchParams({ nickname });
  const result = await requestWithAuth<{ available: boolean }>(
    `/api/v1/users/nickname-availability?${query}`,
    { signal },
  );

  if (typeof result.available !== "boolean") {
    throw new ApiError(
      "protocol",
      "닉네임 확인 응답 형식이 올바르지 않습니다.",
    );
  }
  return result.available;
}

export async function submitOnboarding(
  payload: OnboardingRequest,
  user: AuthUser,
  signal: AbortSignal,
): Promise<AuthUser> {
  if (authMode === "mock") {
    signal.throwIfAborted();
    const { nickname, ...profile } = payload;
    return { ...user, nickname, profile, onboardingCompleted: true };
  }

  const saved = await requestWithAuth<AuthUser>("/api/v1/users/me/onboarding", {
    method: "POST",
    json: payload,
    signal,
  });

  if (saved?.id !== user.id || saved.onboardingCompleted !== true) {
    throw new ApiError("protocol", "온보딩 완료 응답을 확인하지 못했습니다.");
  }
  return saved;
}

export async function getOnboardingUser(
  signal: AbortSignal,
): Promise<AuthUser> {
  return requestWithAuth<AuthUser>("/api/v1/users/me", { signal });
}

export type ActivityArea = { id: string; label: string };

type Location = { code: string; name: string };

export async function getOnboardingActivityAreas(
  signal: AbortSignal,
): Promise<ActivityArea[]> {
  if (authMode === "mock") {
    signal.throwIfAborted();
    return mockActivityAreas;
  }

  const cities = await requestWithAuth<Location[]>("/api/v1/cities", {
    signal,
  });
  const seoul = cities.find(({ code }) => code === "11");
  if (!seoul)
    throw new ApiError("protocol", "서울시 지역 정보를 찾을 수 없습니다.");

  const areas = await requestWithAuth<Location[]>(
    `/api/v1/cities/${seoul.code}/areas`,
    { signal },
  );
  return areas.map(({ code, name }) => ({ id: code, label: name }));
}
