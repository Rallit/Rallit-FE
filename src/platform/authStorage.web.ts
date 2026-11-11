import type { AuthTarget } from "@/apis/auth.types";

function getStorageKey(target: AuthTarget) {
  return `rallit.${target}.accessToken`;
}

export function getAccessToken(target: AuthTarget = "service") {
  return window.sessionStorage.getItem(getStorageKey(target));
}

export function setAccessToken(
  accessToken: string,
  target: AuthTarget = "service",
) {
  window.sessionStorage.setItem(getStorageKey(target), accessToken);
}

export function clearAccessToken(target: AuthTarget = "service") {
  window.sessionStorage.removeItem(getStorageKey(target));
}
