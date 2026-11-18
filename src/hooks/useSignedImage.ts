import { useCallback, useEffect, useState } from "react";
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
  const refresh = useCallback(() => setAttempt((count) => count + 1), []);

  useEffect(() => {
    if (!path) return;

    const imagePath = path;
    const controller = new AbortController();
    let refreshTimer: ReturnType<typeof setTimeout>;
    let failures = 0;

    async function load() {
      try {
        const image = await getSignedImage(imagePath, controller.signal);
        if (controller.signal.aborted) return;
        const expiresAt = image ? Date.parse(image.expiresAt) : Infinity;
        if (image && (!Number.isFinite(expiresAt) || expiresAt <= Date.now())) {
          throw new Error("이미지 주소가 만료되었습니다.");
        }
        setState({ path: imagePath, url: image?.url ?? null, expiresAt });
        failures = 0;
        if (!image) return;

        refreshTimer = setTimeout(
          () => void load(),
          Math.max(1_000, expiresAt - Date.now() - REFRESH_MARGIN_MS),
        );
      } catch {
        if (controller.signal.aborted) return;
        setState((current) =>
          current &&
          current.path === imagePath &&
          current.expiresAt > Date.now()
            ? current
            : { path: imagePath, url: null, expiresAt: Infinity },
        );
        // 장애가 길어져도 만료 후 복구를 시도하되 요청 간격은 최대 30초입니다.
        const delay = Math.min(30_000, 1_000 * 2 ** Math.min(failures++, 5));
        refreshTimer = setTimeout(() => void load(), delay);
      }
    }

    void load();

    return () => {
      controller.abort();
      clearTimeout(refreshTimer);
    };
  }, [path, attempt]);

  useEffect(() => {
    if (!state?.url || !Number.isFinite(state.expiresAt)) return;
    const timer = setTimeout(
      () => {
        setState((current) =>
          current === state ? { ...current, url: null } : current,
        );
      },
      Math.max(0, state.expiresAt - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [state]);

  const url = path && state?.path === path ? state.url : null;

  // <img onError>에서 호출하면 기본 이미지로 바꿉니다.
  const handleError = () =>
    setState((current) =>
      current && current.path === path ? { ...current, url: null } : current,
    );

  return { url, handleError, refresh };
}
