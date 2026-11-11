import { useState } from "react";
import { mockStartLogin } from "@/apis/auth.mock";

type SocialProvider = "kakao" | "google";

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] =
    useState<SocialProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const isLoading = loadingProvider !== null;

  const handleLogin = async (provider: SocialProvider) => {
    if (isLoading) return;

    setLoadingProvider(provider);
    setErrorMessage("");

    try {
      await mockStartLogin();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "로그인 중 오류가 발생했습니다.",
      );
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <main aria-busy={isLoading}>
      <h1>로그인</h1>

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
    </main>
  );
}