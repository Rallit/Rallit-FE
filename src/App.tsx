import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ServiceIntro } from "@/components/intro/ServiceIntro";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  MainTabPlaceholder,
  MainTabsLayout,
} from "@/components/layout/MainTabsLayout";
import {
  MATCH_REQUEST_COMPLETE_PATH,
  MATCH_REQUEST_RESULTS_PATH,
  MATCH_REQUEST_PATH,
  SAVED_MATCH_REQUEST_RESULTS_PATH,
} from "@/features/match-request/form";
import { useAuthContext } from "@/hooks/useAuthContext";
import AuthCompletePage from "@/pages/AuthCompletePage";
import HomePage from "@/pages/HomePage";
import MatchSchedulePage from "@/pages/MatchSchedulePage";
import LoginPage from "@/pages/LoginPage";
import MatchRequestCompletePage from "@/pages/MatchRequestCompletePage";
import MatchRequestPage from "@/pages/MatchRequestPage";
import MatchRequestResultsPage from "@/pages/MatchRequestResultsPage";
import OnboardingPage from "@/pages/OnboardingPage";
import MatchDetailPage from "@/pages/MatchDetailPage";
import { HOST_MATCH_NEW_PATH } from "@/features/host-match/form";
import HostMatchNewPage from "@/pages/HostMatchNewPage";

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
          <Route element={<MainTabsLayout />}>
            <Route
              index
              element={
                authState.status === "authenticated" && (
                  <HomePage
                    userId={authState.user.id}
                    onRequestMatch={() => void navigate(MATCH_REQUEST_PATH)}
                  />
                )
              }
            />
            <Route path="schedule" element={<MatchSchedulePage />} />
            <Route path="my" element={<MainTabPlaceholder title="마이" />} />
          </Route>
          <Route path="/matches/:matchId" element={<MatchDetailPage />} />
          <Route path={HOST_MATCH_NEW_PATH} element={<HostMatchNewPage />} />
          <Route path={MATCH_REQUEST_PATH} element={<MatchRequestPage />} />
          <Route
            path={MATCH_REQUEST_COMPLETE_PATH}
            element={<MatchRequestCompletePage />}
          />
          <Route
            path={MATCH_REQUEST_RESULTS_PATH}
            element={<MatchRequestResultsPage />}
          />
          <Route
            path={SAVED_MATCH_REQUEST_RESULTS_PATH}
            element={<MatchRequestResultsPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
