import { authMode } from "@/platform/authConfig.web";
import { getMatchRequest, matchFormats, type MatchRequest } from "./form";

export type StoredMatchRequest = {
  id: string;
  createdAt: number;
  request: MatchRequest;
};

const memoryRequests = new Map<string, StoredMatchRequest>();

function userPrefix(userId: number) {
  return `rallit.match-requests.${authMode}.${userId}.`;
}

function readStoredRequest(raw: string | null): StoredMatchRequest | null {
  if (raw === null) return null;

  try {
    const entry = JSON.parse(raw) as StoredMatchRequest;
    const { request } = entry;
    if (
      typeof entry.id !== "string" ||
      !Number.isFinite(entry.createdAt) ||
      typeof request.sameGenderOnly !== "boolean" ||
      !Array.isArray(request.ntrp) ||
      request.ntrp.length !== 2 ||
      !request.ntrp.every(Number.isFinite) ||
      !request.dates.every(
        (date) =>
          typeof date === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(date) &&
          Number.isFinite(Date.parse(date + "T00:00:00")),
      ) ||
      !request.activityAreas.every(
        ({ id, label }) => typeof id === "string" && typeof label === "string",
      ) ||
      !request.matchFormats.every((format) =>
        matchFormats.some(({ value }) => value === format),
      )
    ) {
      return null;
    }

    const validRequest = getMatchRequest(request);
    return validRequest ? { ...entry, request: validRequest } : null;
  } catch {
    return null;
  }
}

export function storeMatchRequest(userId: number, request: MatchRequest) {
  const entry = {
    id: crypto.getRandomValues(new Uint32Array(4)).join("-"),
    createdAt: Date.now(),
    request,
  };
  const key = userPrefix(userId) + entry.id;

  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    memoryRequests.set(key, entry);
  }
}

export function getStoredMatchRequests(userId: number): StoredMatchRequest[] {
  const prefix = userPrefix(userId);
  const requests = new Map<string, StoredMatchRequest>();

  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(prefix)) continue;
      const entry = readStoredRequest(localStorage.getItem(key));
      if (entry) requests.set(entry.id, entry);
    }
  } catch {
    // Storage can be unavailable in some browsers.
  }

  for (const [key, entry] of memoryRequests) {
    if (key.startsWith(prefix)) requests.set(entry.id, entry);
  }

  return [...requests.values()].sort((a, b) => b.createdAt - a.createdAt);
}
