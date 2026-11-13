import type { AuthTarget } from "@/apis/auth.types";

const memoryTokens = new Map<AuthTarget, string>();
let storageUnavailable = false;

function getStorageKey(target: AuthTarget) {
  return `rallit.${target}.accessToken`;
}

function enableMemoryStorage() {
  if (storageUnavailable) return;

  storageUnavailable = true;
  console.warn(
    "브라우저 저장소를 사용할 수 없어 인증 토큰을 메모리에 보관합니다.",
  );
}

export function getAccessToken(target: AuthTarget = "service") {
  if (storageUnavailable) {
    return memoryTokens.get(target) ?? null;
  }

  try {
    const token = window.sessionStorage.getItem(getStorageKey(target));

    if (token === null) {
      memoryTokens.delete(target);
    } else {
      memoryTokens.set(target, token);
    }

    return token;
  } catch {
    enableMemoryStorage();
    return memoryTokens.get(target) ?? null;
  }
}

export function setAccessToken(
  accessToken: string,
  target: AuthTarget = "service",
) {
  memoryTokens.set(target, accessToken);
  if (storageUnavailable) return;

  try {
    window.sessionStorage.setItem(getStorageKey(target), accessToken);
  } catch {
    enableMemoryStorage();
  }
}

export function clearAccessToken(target: AuthTarget = "service") {
  memoryTokens.delete(target);

  try {
    window.sessionStorage.removeItem(getStorageKey(target));
  } catch {
    enableMemoryStorage();
  }
}

const pendingLogouts = new Map<AuthTarget, boolean>();

export function hasPendingLogout(target: AuthTarget = "service") {
  const cached = pendingLogouts.get(target);
  if (cached !== undefined) return cached;

  try {
    const pending =
      window.sessionStorage.getItem(`rallit.${target}.logoutPending`) === "1";
    pendingLogouts.set(target, pending);
    return pending;
  } catch {
    enableMemoryStorage();
    return false;
  }
}

export function setPendingLogout(
  pending: boolean,
  target: AuthTarget = "service",
) {
  pendingLogouts.set(target, pending);

  try {
    window.sessionStorage.setItem(
      `rallit.${target}.logoutPending`,
      pending ? "1" : "0",
    );
  } catch {
    enableMemoryStorage();
  }
}