import { Navigate, Outlet, Route, Routes } from "react-router";
import { PageLayout } from "@/components/layout/PageLayout.tsx";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthContext } from "@/hooks/useAuthContext";
import AuthCompletePage from "@/pages/AuthCompletePage";
import LoginPage from "@/pages/LoginPage";

function AuthStatusGate() {
  const { authState, retry } = useAuthContext();

  if (authState.status === "checking") {
    return <p role="status">로그인 상태를 확인하고 있습니다…</p>;
  }

  if (authState.status === "error") {
    return (
      <section>
        <p role="alert">{authState.message}</p>
        <button type="button" onClick={retry}>
          다시 시도
        </button>
      </section>
    );
  }

  return <Outlet />;
}

export default function App() {
  const { authState, completeLogin, logout } = useAuthContext();
  const loginDestination =
    authState.status === "authenticated" && authState.user.onboardingCompleted
      ? "/"
      : "/onboarding";

  return (
    <PageLayout>
      <Routes>
        <Route path="/auth/callback" element={<AuthCompletePage />} />

        <Route
          path="/login"
          element={
            authState.status === "authenticated" ? (
              <Navigate to={loginDestination} replace />
            ) : (
              <LoginPage onLoginSuccess={completeLogin} />
            )
          }
        />

        <Route element={<AuthStatusGate />}>
          <Route element={<ProtectedRoute onboarding="pending" />}>
            <Route
              path="/onboarding"
              element={
                <>
                  <h1>온보딩</h1>
                  <button type="button" onClick={() => void logout()}>
                    로그아웃
                  </button>
                </>
              }
            />
          </Route>

          <Route element={<ProtectedRoute onboarding="completed" />}>
            <Route
              path="/"
              element={
                <>
                  <h1>홈</h1>
                  <button type="button" onClick={() => void logout()}>
                    로그아웃
                  </button>
                </>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </PageLayout>
  );
}
