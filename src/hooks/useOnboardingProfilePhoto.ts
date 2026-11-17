import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/apis/client";
import { uploadProfileImage } from "@/apis/profileImage";
import { useSignedImage } from "@/hooks/useSignedImage";
import { authMode } from "@/platform/authConfig.web";

function uploadErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) return "사진 형식이나 해상도를 확인해 주세요.";
    if (error.status === 413) return "5MB 이하의 사진을 선택해 주세요.";
    if (error.status === 503)
      return "사진을 처리할 수 없어요. 잠시 후 다시 시도해 주세요.";
  }
  return "사진을 등록하지 못했어요. 다시 시도해 주세요.";
}

function useObjectUrlCleanup(url: string | null) {
  useEffect(() => {
    if (url) return () => URL.revokeObjectURL(url);
  }, [url]);
}

export function useOnboardingProfilePhoto(
  path: string | null,
  onUploaded: (path: string) => void,
) {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const request = useRef<AbortController | null>(null);
  const stored = useSignedImage(authMode === "mock" ? null : path);

  useObjectUrlCleanup(uploadedUrl);
  useObjectUrlCleanup(pendingUrl);
  useEffect(() => () => request.current?.abort(), []);

  async function selectPhoto(file: File) {
    if (request.current) return;
    setUploadError("");

    if (authMode === "mock") {
      setUploadedUrl(URL.createObjectURL(file));
      return;
    }

    const controller = new AbortController();
    request.current = controller;
    setPendingUrl(URL.createObjectURL(file));

    try {
      const photoPath = await uploadProfileImage(file, controller.signal);
      if (controller.signal.aborted) return;
      setUploadedUrl(URL.createObjectURL(file));
      onUploaded(photoPath);
    } catch (error) {
      if (!controller.signal.aborted) setUploadError(uploadErrorMessage(error));
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setPendingUrl(null);
    }
  }

  return {
    photoUrl: pendingUrl ?? uploadedUrl ?? stored.url,
    isUploading: pendingUrl !== null,
    uploadError,
    selectPhoto,
  };
}
