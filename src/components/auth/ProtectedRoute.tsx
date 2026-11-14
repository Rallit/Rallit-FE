import { Navigate, Outlet } from "react-router";
import { useAuthContext } from "@/hooks/useAuthContext";

type ProtectedRouteProps = {
  onboarding?: "any" | "pending" | "completed";
};

export default function ProtectedRoute({
  onboarding = "any",
}: ProtectedRouteProps) {
  const { authState } = useAuthContext();

  // 확인 중·오류 상태는 App에서 먼저 처리합니다.
  if (authState.status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  if (onboarding === "completed" && !authState.user.onboardingCompleted) {
    return <Navigate to="/onboarding/intro" replace />;
  }

  if (onboarding === "pending" && authState.user.onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
