import { Link, Navigate, useSearchParams } from "react-router";
import { useAuthContext } from "@/hooks/useAuthContext";

function getCallbackError(params: URLSearchParams): string | null {
  const error = params.get("error");
  if (error === null) return null;

  if (error === "account_exists") {
    const provider = params.get("existingProvider");
    const label =
      provider === "kakao"
        ? "카카오"
        : provider === "google"
          ? "구글"
          : "다른 로그인 수단";

    return `이미 ${label}로 가입된 이메일입니다. 해당 로그인 수단을 이용해주세요.`;
  }

  if (error === "email_required") {
    return "소셜 계정의 인증된 이메일 제공 동의를 확인해주세요.";
  }

  return "로그인에 실패했습니다. 다시 시도해주세요.";
}

export default function AuthCompletePage() {
  const [params] = useSearchParams();
  const { authState, retry } = useAuthContext();
  const callbackError = getCallbackError(params);

  if (callbackError) {
    return (
      <section>
        <p role="alert">{callbackError}</p>
        <Link to="/login" replace>
          로그인으로 돌아가기
        </Link>
      </section>
    );
  }

  if (authState.status === "checking") {
    return <p role="status">로그인을 완료하고 있습니다…</p>;
  }

  if (authState.status === "error") {
    return (
      <section>
        <p role="alert">{authState.message}</p>
        <button type="button" onClick={retry}>
          다시 시도
        </button>
        <Link to="/login" replace>
          로그인으로 돌아가기
        </Link>
      </section>
    );
  }

  if (authState.status === "unauthenticated") {
    return (
      <section>
        <p role="alert">
          로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.
        </p>
        <Link to="/login" replace>
          로그인으로 돌아가기
        </Link>
      </section>
    );
  }

  return (
    <Navigate
      to={authState.user.onboardingCompleted ? "/" : "/onboarding/intro"}
      replace
    />
  );
}
