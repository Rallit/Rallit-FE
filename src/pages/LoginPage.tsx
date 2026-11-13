import { useState } from "react";
import { mockStartLogin } from "@/apis/auth.mock";
import type { AuthUser } from "@/apis/auth.types";
import { authMode } from "@/platform/authConfig.web";
import {
  startSocialLogin,
  type SocialProvider,
} from "@/platform/authNavigation.web";
import { useAuthContext } from "@/hooks/useAuthContext";
import { completePendingLogout } from "@/services/authSession";

type LoginPageProps = {
  onLoginSuccess: (user: AuthUser) => void;
};

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { isLoggingOut, logoutError } = useAuthContext();
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const isLoading = loadingProvider !== null || isLoggingOut;

  const handleLogin = async (provider: SocialProvider) => {
    if (isLoading) return;

    setLoadingProvider(provider);
    setErrorMessage("");

    try {
      if (authMode === "api") {
        await completePendingLogout();
        startSocialLogin(provider);
        return;
      }
      const user = await mockStartLogin("new-user");
      onLoginSuccess(user);
      setLoadingProvider(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "로그인 중 오류가 발생했습니다.",
      );
      setLoadingProvider(null);
    }
  };

  return (
    <section aria-busy={isLoading}>
      <h1>로그인</h1>
      {isLoggingOut && <p role="status">로그아웃 처리 중…</p>}
      {logoutError && <p role="alert">{logoutError}</p>}

      <button
        type="button"
        disabled={isLoading}
        onClick={() => handleLogin("kakao")}
      >
        {loadingProvider === "kakao" ? "처리 중…" : "카카오로 시작하기"}
      </button>

      <button
        type="button"
        disabled={isLoading}
        onClick={() => handleLogin("google")}
      >
        {loadingProvider === "google" ? "처리 중…" : "구글로 시작하기"}
      </button>

      {errorMessage && <p role="alert">{errorMessage}</p>}
    </section>
  );
}
