import { useState } from "react";
import logoWhite from "../../assets/images/rallit-logo-white.svg";
import { mockStartLogin } from "@/apis/auth.mock";
import type { AuthUser } from "@/apis/auth.types";
import { SocialLoginButton } from "@/components/auth/SocialLoginButton";
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
    <main
      aria-busy={isLoading}
      className="box-border mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-(--common-black) pt-[env(safe-area-inset-top,0px)] pr-[env(safe-area-inset-right,0px)] pb-[max(env(safe-area-inset-bottom,0px),34px)] pl-[env(safe-area-inset-left,0px)]"
    >
      <h1 className="m-0 flex justify-center pt-[81px]">
        <img src={logoWhite} alt="Rallit" className="block" />
      </h1>

      <div className="mt-auto grid gap-(--spacing-gap-small) px-(--spacing-padding-large)">
        {isLoggingOut && (
          <p
            role="status"
            className="typography-label-r-medium m-0 text-center text-(color:--fg-neutral-inverse)"
          >
            로그아웃 처리 중…
          </p>
        )}
        {logoutError && (
          <p
            role="alert"
            className="typography-label-r-medium m-0 text-center text-(color:--fg-neutral-inverse)"
          >
            {logoutError}
          </p>
        )}
        {errorMessage && (
          <p
            role="alert"
            className="typography-label-r-medium m-0 text-center text-(color:--fg-neutral-inverse)"
          >
            {errorMessage}
          </p>
        )}

        <SocialLoginButton
          provider="kakao"
          loading={loadingProvider === "kakao"}
          disabled={isLoading}
          onClick={() => handleLogin("kakao")}
        />
        <SocialLoginButton
          provider="google"
          loading={loadingProvider === "google"}
          disabled={isLoading}
          onClick={() => handleLogin("google")}
        />
      </div>
    </main>
  );
}
