import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getActivityAreas } from "@/apis/locations";
import { getSavedMatchRequests } from "@/apis/matchRequests";
import { ActionButton } from "@/components/ActionButton";
import {
  MATCH_REQUEST_RESULTS_PATH,
  savedMatchRequestResultsPath,
} from "@/features/match-request/form";
import { getStoredMatchRequests } from "@/features/match-request/storage.web";
import {
  toSavedMatchRequestSummary,
  type MatchRequestSummary,
} from "@/features/match-request/summary";
import { authMode } from "@/platform/authConfig.web";
import { HomeMatchRequestCard } from "./HomeMatchRequestCard";

type RequestCard = {
  id: number | string;
  request: MatchRequestSummary;
  onClick: () => void;
};

const MAX_ACTIVE_MATCH_REQUESTS = 3;

export function HomeMatchRequestList({
  userId,
  onRequestMatch,
  promptSpacing,
}: {
  userId: number;
  onRequestMatch?: () => void;
  promptSpacing: string;
}) {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    attempt: number;
    count: number;
    cards?: RequestCard[] | null;
  }>();
  const mock = authMode === "mock";

  useEffect(() => {
    if (mock) return;

    const controller = new AbortController();
    getSavedMatchRequests(controller.signal)
      .then(async (requests) => {
        if (controller.signal.aborted) return [];
        setResult({ attempt, count: requests.length });
        if (!requests.length) return [];
        const areas = await getActivityAreas(controller.signal);
        return requests.map((request) => ({
          id: request.requestId,
          request: toSavedMatchRequestSummary(request, areas),
          onClick: () =>
            void navigate(savedMatchRequestResultsPath(request.requestId)),
        }));
      })
      .then(
        (cards) => {
          if (!controller.signal.aborted)
            setResult({ attempt, count: cards.length, cards });
        },
        () => {
          if (!controller.signal.aborted)
            setResult((previous) => ({
              attempt,
              count: previous?.count ?? 0,
              cards: null,
            }));
        },
      );

    return () => controller.abort();
  }, [attempt, mock, navigate]);

  const current = result?.attempt === attempt ? result : undefined;
  const cards = mock
    ? getStoredMatchRequests(userId).map(({ id, request }) => ({
        id,
        request,
        onClick: () =>
          void navigate(MATCH_REQUEST_RESULTS_PATH, { state: request }),
      }))
    : current?.cards;
  const requestCount = mock ? (cards?.length ?? 0) : (result?.count ?? 0);

  return (
    <>
      <div
        className={`${promptSpacing} flex items-center justify-between gap-(--spacing-gap-medium) rounded-(--radius-large) bg-(--bg-neutral-default) p-(--spacing-padding-medium)`}
      >
        <p className="typography-body-bold m-0 text-(color:--fg-neutral-default)">
          내 일정에 딱 맞는 매치
        </p>
        <ActionButton
          variant="tertiary"
          size="S"
          onClick={onRequestMatch}
          disabled={requestCount >= MAX_ACTIVE_MATCH_REQUESTS}
          className="shrink-0 whitespace-nowrap"
        >
          요청하기
        </ActionButton>
      </div>
      {cards === undefined ? (
        <p
          role="status"
          className="typography-label-r-medium m-0 text-(color:--fg-neutral-tertiary)"
        >
          매칭 요청을 불러오는 중이에요.
        </p>
      ) : cards === null ? (
        <div className="flex items-center justify-between gap-(--spacing-gap-small)">
          <p
            role="alert"
            className="typography-label-r-medium m-0 text-(color:--fg-neutral-tertiary)"
          >
            매칭 요청을 불러오지 못했어요.
          </p>
          <ActionButton
            variant="tertiary"
            size="S"
            onClick={() => setAttempt((count) => count + 1)}
          >
            다시 시도
          </ActionButton>
        </div>
      ) : cards.length > 0 ? (
        <ul
          aria-label="매칭 요청 목록"
          className="m-0 grid min-w-0 list-none gap-(--spacing-gap-small) p-0"
        >
          {cards.map(({ id, request, onClick }) => (
            <li key={id}>
              <HomeMatchRequestCard
                request={request}
                hasNewMatches={mock}
                onClick={onClick}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
