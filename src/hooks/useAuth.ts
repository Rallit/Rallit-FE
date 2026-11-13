import { useCallback, useEffect, useRef, useState } from "react";
import type { AuthState, AuthUser } from "@/apis/auth.types";

type RestoreUser = () => Promise<AuthUser | null>;
type LogoutUser = () => Promise<void>;

export function useAuth(
  restoreUser: RestoreUser,
  logoutUser: LogoutUser,
  skipInitialRestore = false,
) {
  const [authState, setAuthState] = useState<AuthState>(
    skipInitialRestore ? { status: "unauthenticated" } : { status: "checking" },
  );
  const [retryCount, setRetryCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const requestVersion = useRef(0);
  const logoutInProgress = useRef(false);

  useEffect(() => {
    if (skipInitialRestore && retryCount === 0) return;

    let active = true;
    const version = ++requestVersion.current;

    restoreUser().then(
      (user) => {
        if (!active || version !== requestVersion.current) return;

        setAuthState(
          user
            ? { status: "authenticated", user }
            : { status: "unauthenticated" },
        );
      },
      (error: unknown) => {
        if (!active || version !== requestVersion.current) return;

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
  }, [restoreUser, skipInitialRestore, retryCount]);

  const clearSession = useCallback(() => {
    requestVersion.current += 1;
    setAuthState({ status: "unauthenticated" });
  }, []);

  const retry = useCallback(() => {
    if (logoutInProgress.current) return;

    requestVersion.current += 1;
    setLogoutError("");
    setAuthState({ status: "checking" });
    setRetryCount((count) => count + 1);
  }, []);

  const completeLogin = useCallback((user: AuthUser) => {
    if (logoutInProgress.current) return;

    requestVersion.current += 1;
    setLogoutError("");
    setAuthState({ status: "authenticated", user });
  }, []);

  const logout = useCallback(async () => {
    if (logoutInProgress.current) return;

    logoutInProgress.current = true;
    requestVersion.current += 1;
    setIsLoggingOut(true);
    setLogoutError("");
    setAuthState({ status: "unauthenticated" });

    try {
      await logoutUser();
    } catch {
      setLogoutError(
        "서버 로그아웃에 실패했습니다. 이 기기의 로그인 정보는 초기화했습니다.",
      );
    } finally {
      logoutInProgress.current = false;
      setIsLoggingOut(false);
    }
  }, [logoutUser]);

  return {
    authState,
    retry,
    completeLogin,
    logout,
    isLoggingOut,
    logoutError,
    clearSession,
  };
}
