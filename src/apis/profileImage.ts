import { ApiError } from "@/apis/client";
import { requestWithAuth } from "@/services/authSession";

const profileImagePath = /^\/api\/v1\/users\/\d+\/profile-image$/;

export async function uploadProfileImage(
  file: File,
  signal: AbortSignal,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const result = await requestWithAuth<{ profileImageUrl: string }>(
    "/api/v1/users/me/profile-image",
    { method: "PUT", formData, signal },
  );

  if (
    typeof result.profileImageUrl !== "string" ||
    !profileImagePath.test(result.profileImageUrl)
  ) {
    throw new ApiError(
      "protocol",
      "프로필 사진 조회 경로가 올바르지 않습니다.",
    );
  }

  return result.profileImageUrl;
}

export async function getProfileImage(
  path: string,
  signal: AbortSignal,
): Promise<Blob | null> {
  if (!profileImagePath.test(path)) {
    throw new ApiError("request", "프로필 사진 조회 경로가 올바르지 않습니다.");
  }

  try {
    const image = await requestWithAuth(path, {
      headers: { Accept: "image/jpeg, image/png" },
      responseType: "blob",
      cache: "no-store",
      signal,
    });

    if (
      !image.size ||
      (image.type !== "image/jpeg" && image.type !== "image/png")
    ) {
      throw new ApiError(
        "protocol",
        "프로필 사진 응답 형식이 올바르지 않습니다.",
      );
    }

    return image;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
