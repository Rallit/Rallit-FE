import { ApiError } from "@/apis/client";
import { requestWithAuth } from "@/services/authSession";

// 응답 필드로 받는 이미지 상대 경로(노션 「Presigned URL 전환」 기준)
const imagePathPatterns = [
  /^\/api\/v1\/users\/\d+\/profile-image$/,
  /^\/api\/v1\/courts\/\d+\/thumbnail$/,
];

export type SignedImage = { url: string; expiresAt: string };

export function isImagePath(path: string) {
  return imagePathPatterns.some((pattern) => pattern.test(path));
}

// 상대 경로 끝에 /url을 붙여 서명 URL을 발급받습니다. 사진이 없으면(404) null입니다.
export async function getSignedImage(
  path: string,
  signal: AbortSignal,
): Promise<SignedImage | null> {
  if (!isImagePath(path)) {
    throw new ApiError("request", "이미지 경로가 올바르지 않습니다.");
  }

  try {
    const result = await requestWithAuth<SignedImage>(`${path}/url`, {
      signal,
    });
    if (
      typeof result?.url !== "string" ||
      typeof result.expiresAt !== "string"
    ) {
      throw new ApiError(
        "protocol",
        "이미지 주소 응답 형식이 올바르지 않습니다.",
      );
    }
    return result;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
