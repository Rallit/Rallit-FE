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

function waitForRetry(delay: number, signal: AbortSignal) {
  signal.throwIfAborted();
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, delay);
    function abort() {
      clearTimeout(timer);
      reject(signal.reason);
    }
    signal.addEventListener("abort", abort, { once: true });
  });
}

async function completeUpload(uploadId: string, signal: AbortSignal) {
  for (let attempt = 0; ; attempt++) {
    signal.throwIfAborted();
    try {
      return await requestWithAuth<{ profileImageUrl: string }>(
        `/api/v1/users/me/profile-image/uploads/${encodeURIComponent(uploadId)}/complete`,
        { method: "POST", signal },
      );
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        error.status !== 409 ||
        attempt >= 2
      ) {
        throw error;
      }
      await waitForRetry(500 * (attempt + 1), signal);
    }
  }
}

async function uploadOnce(file: File, signal: AbortSignal): Promise<string> {
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

  const result = await completeUpload(ticket.uploadId, signal);

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

// 409는 같은 업로드의 완료 단계만, 410은 새 발급부터 한 번만 재시도합니다.
export async function uploadProfileImage(file: File, signal: AbortSignal) {
  for (let attempt = 0; ; attempt++) {
    signal.throwIfAborted();
    try {
      return await uploadOnce(file, signal);
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        error.status !== 410 ||
        attempt >= 1
      ) {
        throw error;
      }
    }
  }
}
