import { useEffect, useState } from "react";
import { getSignedImage } from "@/apis/images";

// 만료 30초 전에 미리 다시 발급받습니다.
const REFRESH_MARGIN_MS = 30_000;

type SignedImageState = {
  path: string;
  url: string | null;
  expiresAt: number;
};

// 이미지 상대 경로를 화면에 쓸 서명 URL로 바꿉니다. 없거나 실패하면 null(기본 이미지)입니다.
export function useSignedImage(path: string | null | undefined) {
  const [state, setState] = useState<SignedImageState | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!path) return;

    const controller = new AbortController();
    getSignedImage(path, controller.signal).then(
      (image) => {
        if (controller.signal.aborted) return;
        setState({
          path,
          url: image?.url ?? null,
          expiresAt: image ? Date.parse(image.expiresAt) : Infinity,
        });
      },
      () => {
        if (!controller.signal.aborted)
          setState({ path, url: null, expiresAt: Infinity });
      },
    );

    return () => controller.abort();
  }, [path, attempt]);

  useEffect(() => {
    if (!state?.url || !Number.isFinite(state.expiresAt)) return;

    const delay = Math.max(0, state.expiresAt - Date.now() - REFRESH_MARGIN_MS);
    const timer = setTimeout(() => setAttempt((count) => count + 1), delay);
    return () => clearTimeout(timer);
  }, [state]);

  const url = path && state?.path === path ? state.url : null;

  // <img onError>에서 호출하면 기본 이미지로 바꿉니다.
  const handleError = () =>
    setState((current) =>
      current && current.path === path ? { ...current, url: null } : current,
    );

  return { url, handleError };
}
