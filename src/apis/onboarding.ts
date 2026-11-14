import { ApiError } from "@/apis/client";
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
