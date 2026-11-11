import { PageLayout } from "@/components/layout/PageLayout.tsx";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/LoginPage";

export default function App() {
  const { authState, retry, completeLogin } = useAuth("guest");

  if (authState.status === "checking") {
    return (
      <PageLayout>
        <p role="status">로그인 상태를 확인하고 있습니다…</p>
      </PageLayout>
    );
  }

  if (authState.status === "error") {
    return (
      <PageLayout>
        <p role="alert">{authState.message}</p>
        <button type="button" onClick={retry}>
          다시 시도
        </button>
      </PageLayout>
    );
  }

  if (authState.status === "unauthenticated") {
    return (
      <PageLayout>
        <LoginPage onLoginSuccess={completeLogin} />
      </PageLayout>
    );
  }

  const { user } = authState;

  return (
    <PageLayout>
      <h1>{user.onboardingCompleted ? "홈" : "온보딩"}</h1>
    </PageLayout>
  );
}
