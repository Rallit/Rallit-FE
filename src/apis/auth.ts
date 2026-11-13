import { apiClient } from "./index";
import { ApiError } from "./client";
import type { AuthTarget, AuthUser, RefreshResult } from "./auth.types";
import type { ApiRequestOptions } from "./types";

const endpoints = {
  service: {
    refresh: "/api/v1/auth/refresh",
    me: "/api/v1/users/me",
    logout: "/api/v1/auth/logout",
  },
  admin: {
    refresh: "/api/v1/admin/auth/refresh",
    me: "/api/v1/admin/me",
    logout: "/api/v1/admin/auth/logout",
  },
} as const;

const cookieRequestOptions = {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  json: {},
} satisfies ApiRequestOptions;

async function withAuthTimeout<TResult>(
  request: (signal: AbortSignal) => Promise<TResult>,
): Promise<TResult> {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new ApiError(
        "network",
        "인증 요청 시간이 초과되었습니다. 다시 시도해주세요.",
      );
      controller.abort(error);
      reject(error);
    }, 10_000);
  });

  try {
    return await Promise.race([request(controller.signal), timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

const refreshRequests: Partial<Record<AuthTarget, Promise<RefreshResult>>> = {};

export function refreshSession(
  target: AuthTarget = "service",
): Promise<RefreshResult> {
  const pendingRequest = refreshRequests[target];
  if (pendingRequest) return pendingRequest;

  const request = withAuthTimeout((signal) =>
    apiClient.request<RefreshResult>(endpoints[target].refresh, {
      ...cookieRequestOptions,
      signal,
    }),
  ).finally(() => {
    delete refreshRequests[target];
  });

  refreshRequests[target] = request;
  return request;
}

export function getCurrentUser(
  accessToken: string,
  target: AuthTarget = "service",
): Promise<AuthUser> {
  return withAuthTimeout((signal) =>
    apiClient.request<AuthUser>(endpoints[target].me, {
      signal,
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  );
}

export function logoutSession(target: AuthTarget = "service"): Promise<void> {
  return withAuthTimeout((signal) =>
    apiClient.request(endpoints[target].logout, {
      ...cookieRequestOptions,
      signal,
      expectResult: false,
    }),
  );
}
