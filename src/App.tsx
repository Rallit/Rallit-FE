import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ServiceIntro } from "@/components/intro/ServiceIntro";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  MATCH_REQUEST_COMPLETE_PATH,
  MATCH_REQUEST_RESULTS_PATH,
  MATCH_REQUEST_PATH,
} from "@/features/match-request/form";
import { useAuthContext } from "@/hooks/useAuthContext";
import AuthCompletePage from "@/pages/AuthCompletePage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import MatchRequestCompletePage from "@/pages/MatchRequestCompletePage";
import MatchRequestPage from "@/pages/MatchRequestPage";
import MatchRequestResultsPage from "@/pages/MatchRequestResultsPage";
import OnboardingPage from "@/pages/OnboardingPage";

function AuthStatusGate() {
  const { authState, retry } = useAuthContext();

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
        <section>
          <p role="alert">{authState.message}</p>
          <button type="button" onClick={retry}>
            다시 시도
          </button>
        </section>
      </PageLayout>
    );
  }

  return <Outlet />;
}

function OnboardingIntroRoute() {
  const { authState } = useAuthContext();
  const navigate = useNavigate();

  return (
    <ServiceIntro
      displayName={
        authState.status === "authenticated"
          ? (authState.user.socialDisplayName ?? null)
          : null
      }
      onStart={() => void navigate("/onboarding")}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const { authState, completeLogin } = useAuthContext();
  const loginDestination =
    authState.status === "authenticated" && authState.user.onboardingCompleted
      ? "/"
      : "/onboarding/intro";

  return (
    <Routes>
      <Route
        path="/auth/callback"
        element={
          <PageLayout>
            <AuthCompletePage />
          </PageLayout>
        }
      />

      <Route
        path="/login"
        element={
          authState.status === "authenticated" ? (
            <Navigate to={loginDestination} replace />
          ) : authState.status === "checking" ? (
            <PageLayout>
              <p role="status">로그인 상태를 확인하고 있습니다…</p>
            </PageLayout>
          ) : (
            <LoginPage onLoginSuccess={completeLogin} />
          )
        }
      />

      <Route element={<AuthStatusGate />}>
        <Route element={<ProtectedRoute onboarding="pending" />}>
          <Route path="/onboarding/intro" element={<OnboardingIntroRoute />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        <Route element={<ProtectedRoute onboarding="completed" />}>
          <Route
            path="/"
            element={
              <HomePage
                onRequestMatch={
                  import.meta.env.DEV
                    ? () => void navigate(MATCH_REQUEST_PATH)
                    : undefined
                }
              />
            }
          />
          {import.meta.env.DEV && (
            <>
              <Route path={MATCH_REQUEST_PATH} element={<MatchRequestPage />} />
              <Route
                path={MATCH_REQUEST_COMPLETE_PATH}
                element={<MatchRequestCompletePage />}
              />
              <Route
                path={MATCH_REQUEST_RESULTS_PATH}
                element={<MatchRequestResultsPage />}
              />
            </>
          )}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
