import { apiClient } from "./index";
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

const refreshRequests: Partial<Record<AuthTarget, Promise<RefreshResult>>> = {};

export function refreshSession(
  target: AuthTarget = "service",
): Promise<RefreshResult> {
  const pendingRequest = refreshRequests[target];
  if (pendingRequest) return pendingRequest;

  const request = apiClient
    .request<RefreshResult>(endpoints[target].refresh, cookieRequestOptions)
    .finally(() => {
      delete refreshRequests[target];
    });

  refreshRequests[target] = request;
  return request;
}

export function getCurrentUser(
  accessToken: string,
  target: AuthTarget = "service",
): Promise<AuthUser> {
  return apiClient.request<AuthUser>(endpoints[target].me, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function logoutSession(target: AuthTarget = "service"): Promise<void> {
  return apiClient.request(endpoints[target].logout, {
    ...cookieRequestOptions,
    expectResult: false,
  });
}
