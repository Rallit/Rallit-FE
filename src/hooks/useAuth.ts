import { useEffect, useState } from "react";
import { mockGetCurrentUser, type MockAuthScenario } from "@/apis/auth.mock";
import type { AuthState, AuthUser } from "@/apis/auth.types";

export function useAuth(scenario: MockAuthScenario) {
  const [authState, setAuthState] = useState<AuthState>({
    status: "checking",
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    mockGetCurrentUser(scenario).then(
      (user) => {
        if (!active) return;

        setAuthState(
          user
            ? { status: "authenticated", user }
            : { status: "unauthenticated" },
        );
      },
      (error: unknown) => {
        if (!active) return;

        setAuthState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "로그인 상태를 확인하지 못했습니다.",
        });
      },
    );

    return () => {
      active = false;
    };
  }, [scenario, retryCount]);

  const retry = () => {
    setAuthState({ status: "checking" });
    setRetryCount((count) => count + 1);
  };

  const completeLogin = (user: AuthUser) => {
    setAuthState({ status: "authenticated", user });
  };

  return { authState, retry, completeLogin };
}
