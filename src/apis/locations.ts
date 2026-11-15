import { ApiError } from "@/apis/client";
import { authMode } from "@/platform/authConfig.web";
import { requestWithAuth } from "@/services/authSession";

export type ActivityArea = { id: string; label: string };

type Location = { code: string; name: string };

export async function getActivityAreas(
  signal: AbortSignal,
): Promise<ActivityArea[]> {
  if (import.meta.env.DEV && authMode === "mock") {
    const { mockActivityAreas } = await import("@/mocks/activityAreas");
    signal.throwIfAborted();
    return mockActivityAreas;
  }

  const cities = await requestWithAuth<Location[]>("/api/v1/cities", {
    signal,
  });
  const seoul = cities.find(({ code }) => code === "11");
  if (!seoul)
    throw new ApiError("protocol", "서울시 지역 정보를 찾을 수 없습니다.");

  const areas = await requestWithAuth<Location[]>(
    `/api/v1/cities/${seoul.code}/areas`,
    { signal },
  );
  return areas.map(({ code, name }) => ({ id: code, label: name }));
}
