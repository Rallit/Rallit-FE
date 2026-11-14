import type { AuthTarget } from "@/apis/auth.types";

export type SocialProvider = "kakao" | "google";

export function startSocialLogin(
  provider: SocialProvider,
  target: AuthTarget = "service",
) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("API 기본 주소가 설정되지 않았습니다.");
  }

  const url = new URL(baseUrl);
  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.search ||
    url.hash
  ) {
    throw new Error("API 기본 주소 형식이 올바르지 않습니다.");
  }

  url.pathname = `${url.pathname.replace(/\/+$/, "")}/api/v1/auth/${provider}`;
  url.searchParams.set("target", target);
  if (target === "service") {
    url.searchParams.set(
      "callback",
      new URL("/auth/callback", window.location.origin).href,
    );
  }
  window.location.assign(url.href);
}
