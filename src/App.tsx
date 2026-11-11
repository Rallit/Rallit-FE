import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/LoginPage";

export default function App() {
  const { authState, retry, completeLogin } = useAuth("guest");

  if (authState.status === "checking") {
    return <p role="status">로그인 상태를 확인하고 있습니다…</p>;
  }

  if (authState.status === "error") {
    return (
      <main>
        <p role="alert">{authState.message}</p>
        <button type="button" onClick={retry}>
          다시 시도
        </button>
      </main>
    );
  }

  if (authState.status === "unauthenticated") {
    return <LoginPage onLoginSuccess={completeLogin} />;
  }

  const { user } = authState;

  return (
    <main>
      <h1>{user.onboardingCompleted ? "홈" : "온보딩"}</h1>
    </main>
  );
}