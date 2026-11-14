import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/apis/client";
import { getProfileImage, uploadProfileImage } from "@/apis/profileImage";
import { authMode } from "@/platform/authConfig.web";

type UploadedPhoto = { url: string };
type LoadedPhoto = {
  path: string;
  upload: UploadedPhoto | null;
  url: string | null;
};

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
  const [uploaded, setUploaded] = useState<UploadedPhoto | null>(null);
  const [loaded, setLoaded] = useState<LoadedPhoto | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const request = useRef<AbortController | null>(null);

  useObjectUrlCleanup(uploaded?.url ?? null);
  useObjectUrlCleanup(loaded?.url ?? null);
  useObjectUrlCleanup(pendingUrl);
  useEffect(() => () => request.current?.abort(), []);

  useEffect(() => {
    if (!path || authMode === "mock") return;

    const controller = new AbortController();
    getProfileImage(path, controller.signal).then(
      (blob) => {
        if (!controller.signal.aborted) {
          setLoaded({
            path,
            upload: uploaded,
            url: blob ? URL.createObjectURL(blob) : null,
          });
        }
      },
      () => {
        // Keep the successful upload preview if its follow-up request fails.
      },
    );

    return () => controller.abort();
  }, [path, uploaded]);

  const storedUrl =
    loaded && loaded.path === path && loaded.upload === uploaded
      ? loaded.url
      : (uploaded?.url ?? null);

  async function selectPhoto(file: File) {
    if (request.current) return;
    setUploadError("");

    if (authMode === "mock") {
      setUploaded({ url: URL.createObjectURL(file) });
      return;
    }

    const controller = new AbortController();
    request.current = controller;
    setPendingUrl(URL.createObjectURL(file));

    try {
      const photoPath = await uploadProfileImage(file, controller.signal);
      if (controller.signal.aborted) return;
      setUploaded({ url: URL.createObjectURL(file) });
      onUploaded(photoPath);
    } catch (error) {
      if (!controller.signal.aborted) setUploadError(uploadErrorMessage(error));
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setPendingUrl(null);
    }
  }

  return {
    photoUrl: pendingUrl ?? storedUrl,
    isUploading: pendingUrl !== null,
    uploadError,
    selectPhoto,
  };
}
