import { useEffect, useState, type PropsWithChildren } from "react";
import { matchPath, useLocation } from "react-router";
import { AuthContext } from "./AuthContext";
import { mockGetCurrentUser } from "@/apis/auth.mock";
import { useAuth } from "@/hooks/useAuth";
import { authMode } from "@/platform/authConfig.web";
import { clearAccessToken } from "@/platform/authStorage.web";
import {
  logoutAuthSession,
  restoreAuthSession,
  subscribeAuthExpired,
} from "@/services/authSession";

const restoreCurrentUser =
  authMode === "api"
    ? () => restoreAuthSession()
    : () => mockGetCurrentUser("guest");

const logoutCurrentUser =
  authMode === "api"
    ? () => logoutAuthSession()
    : async () => {
        clearAccessToken();
      };

export function AuthProvider({ children }: PropsWithChildren) {
  const { pathname, search } = useLocation();
  const [skipInitialRestore] = useState(
    () =>
      Boolean(matchPath("/auth/callback", pathname)) &&
      new URLSearchParams(search).has("error"),
  );

  const auth = useAuth(
    restoreCurrentUser,
    logoutCurrentUser,
    skipInitialRestore,
  );

  const { clearSession } = auth;

  useEffect(() => {
    if (authMode !== "api") return;

    return subscribeAuthExpired((target) => {
      if (target === "service") {
        clearSession();
      }
    });
  }, [clearSession]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
