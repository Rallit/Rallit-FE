import { ApiError } from "@/apis/client";
import { requestWithAuth } from "@/services/authSession";

const profileImagePath = /^\/api\/v1\/users\/\d+\/profile-image$/;

type ImageUploadTicket = {
  mode: string;
  uploadId: string;
  url: string;
  fields: Record<string, string>;
  expiresAt: string;
};

function getImageContentType(file: File) {
  if (file.type === "image/jpeg" || file.type === "image/png") return file.type;
  return /\.png$/i.test(file.name) ? "image/png" : "image/jpeg";
}

// 발급 → S3 POST → 완료 순서로 프로필 사진을 올리고, 사진 상대 경로를 돌려줍니다.
export async function uploadProfileImage(
  file: File,
  signal: AbortSignal,
): Promise<string> {
  const ticket = await requestWithAuth<ImageUploadTicket>(
    "/api/v1/users/me/profile-image/uploads",
    {
      method: "POST",
      json: {
        fileName: file.name,
        contentType: getImageContentType(file),
        size: file.size,
      },
      signal,
    },
  );
  if (
    typeof ticket?.uploadId !== "string" ||
    typeof ticket.url !== "string" ||
    typeof ticket.fields !== "object" ||
    ticket.fields === null
  ) {
    throw new ApiError(
      "protocol",
      "사진 업로드 발급 응답 형식이 올바르지 않습니다.",
    );
  }

  const form = new FormData();
  for (const [key, value] of Object.entries(ticket.fields)) {
    form.append(key, value);
  }
  form.append("file", file);

  let response: Response;
  try {
    response = await fetch(ticket.url, { method: "POST", body: form, signal });
  } catch (cause) {
    if (signal.aborted) throw cause;
    throw new ApiError("network", "사진을 올리지 못했습니다.", { cause });
  }
  if (!response.ok) {
    throw new ApiError("http", "사진을 올리지 못했습니다.", {
      status: response.status,
    });
  }

  const result = await requestWithAuth<{ profileImageUrl: string }>(
    `/api/v1/users/me/profile-image/uploads/${encodeURIComponent(ticket.uploadId)}/complete`,
    { method: "POST", signal },
  );

  if (
    typeof result?.profileImageUrl !== "string" ||
    !profileImagePath.test(result.profileImageUrl)
  ) {
    throw new ApiError(
      "protocol",
      "프로필 사진 조회 경로가 올바르지 않습니다.",
    );
  }

  return result.profileImageUrl;
}
