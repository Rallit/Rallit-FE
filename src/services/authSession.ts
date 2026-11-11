import { getCurrentUser, logoutSession, refreshSession } from "@/apis/auth";
import { apiClient } from "@/apis";
import { ApiError } from "@/apis/client";
import type { AuthTarget, AuthUser } from "@/apis/auth.types";
import type { ApiRequestOptions } from "@/apis/types";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/platform/authStorage.web";

const sessionVersions: Record<AuthTarget, number> = {
  service: 0,
  admin: 0,
};

const refreshTasks: Partial<Record<AuthTarget, Promise<string | null>>> = {};
const logoutTasks: Partial<Record<AuthTarget, Promise<void>>> = {};
const expiredListeners = new Set<(target: AuthTarget) => void>();

export function subscribeAuthExpired(listener: (target: AuthTarget) => void) {
  expiredListeners.add(listener);

  return () => {
    expiredListeners.delete(listener);
  };
}

function expireSession(target: AuthTarget) {
  sessionVersions[target] += 1;
  clearAccessToken(target);
  expiredListeners.forEach((listener) => listener(target));
}

function loginRequiredError() {
  return new ApiError("api", "다시 로그인해주세요.", {
    status: 401,
    code: "COMMON401",
  });
}

function refreshAccessToken(target: AuthTarget): Promise<string | null> {
  if (logoutTasks[target]) return Promise.resolve(null);

  const pending = refreshTasks[target];
  if (pending) return pending;

  const version = sessionVersions[target];

  const task = refreshSession(target)
    .then(
      (tokens) => {
        if (version !== sessionVersions[target]) return null;

        setAccessToken(tokens.accessToken, target);
        return tokens.accessToken;
      },
      (error: unknown) => {
        if (version !== sessionVersions[target]) return null;

        if (error instanceof ApiError && error.status === 401) {
          expireSession(target);
        }

        throw error;
      },
    )
    .finally(() => {
      delete refreshTasks[target];
    });

  refreshTasks[target] = task;
  return task;
}

export async function restoreAuthSession(
  target: AuthTarget = "service",
): Promise<AuthUser | null> {
  const version = sessionVersions[target];

  try {
    const token = await refreshAccessToken(target);
    if (!token || version !== sessionVersions[target]) return null;

    const user = await getCurrentUser(token, target);
    if (version !== sessionVersions[target]) return null;

    return user;
  } catch (error) {
    if (version !== sessionVersions[target]) return null;

    clearAccessToken(target);

    if (error instanceof ApiError && error.status === 401) {
      expireSession(target);
      return null;
    }

    throw error;
  }
}

export function logoutAuthSession(
  target: AuthTarget = "service",
): Promise<void> {
  const pending = logoutTasks[target];
  if (pending) return pending;

  const version = ++sessionVersions[target];
  clearAccessToken(target);

  const pendingRefresh = refreshTasks[target];

  const task = (async () => {
    // 진행 중인 RT 회전이 끝난 뒤 서버 세션을 폐기합니다.
    if (pendingRefresh) {
      await pendingRefresh.catch(() => undefined);
    }

    try {
      await logoutSession(target);
    } finally {
      if (version === sessionVersions[target]) {
        clearAccessToken(target);
      }
    }
  })().finally(() => {
    delete logoutTasks[target];
  });

  logoutTasks[target] = task;
  return task;
}

export function requestWithAuth(
  path: string,
  options: ApiRequestOptions & { expectResult: false },
  target?: AuthTarget,
): Promise<void>;
export function requestWithAuth<TResult>(
  path: string,
  options?: ApiRequestOptions & { expectResult?: true },
  target?: AuthTarget,
): Promise<TResult>;
export async function requestWithAuth<TResult>(
  path: string,
  options: ApiRequestOptions = {},
  target: AuthTarget = "service",
): Promise<TResult | void> {
  const version = sessionVersions[target];

  const assertCurrentSession = () => {
    if (version !== sessionVersions[target] || logoutTasks[target]) {
      throw loginRequiredError();
    }
  };

  const send = (token: string) => {
    options.signal?.throwIfAborted();

    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);

    const requestOptions = {
      ...options,
      headers,
      credentials: "omit" as const,
    };

    return options.expectResult === false
      ? apiClient.request(path, {
          ...requestOptions,
          expectResult: false,
        })
      : apiClient.request<TResult>(path, {
          ...requestOptions,
          expectResult: true,
        });
  };

  assertCurrentSession();

  const token = getAccessToken(target);

  if (!token) {
    expireSession(target);
    throw loginRequiredError();
  }

  try {
    const result = await send(token);
    assertCurrentSession();
    return result;
  } catch (error) {
    assertCurrentSession();
    options.signal?.throwIfAborted();

    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    const currentToken = getAccessToken(target);
    const nextToken =
      currentToken && currentToken !== token
        ? currentToken
        : await refreshAccessToken(target);

    assertCurrentSession();
    if (!nextToken) throw loginRequiredError();

    try {
      const result = await send(nextToken);
      assertCurrentSession();
      return result;
    } catch (retryError) {
      assertCurrentSession();

      if (retryError instanceof ApiError && retryError.status === 401) {
        expireSession(target);
      }

      throw retryError;
    }
  }
}
