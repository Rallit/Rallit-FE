import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getActivityAreas } from "@/apis/locations";
import { getSavedMatchRequests } from "@/apis/matchRequests";
import { ActionButton } from "@/components/ActionButton";
import { MATCH_REQUEST_RESULTS_PATH } from "@/features/match-request/form";
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
  onClick?: () => void;
};

export function HomeMatchRequestList({ userId }: { userId: number }) {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    attempt: number;
    cards: RequestCard[] | null;
  }>();
  const mock = authMode === "mock";

  useEffect(() => {
    if (mock) return;

    const controller = new AbortController();
    getSavedMatchRequests(controller.signal)
      .then(async (requests) => {
        if (!requests.length) return [];
        const areas = await getActivityAreas(controller.signal);
        return requests.map((request) => ({
          id: request.requestId,
          request: toSavedMatchRequestSummary(request, areas),
        }));
      })
      .then(
        (cards) => {
          if (!controller.signal.aborted) setResult({ attempt, cards });
        },
        () => {
          if (!controller.signal.aborted) setResult({ attempt, cards: null });
        },
      );

    return () => controller.abort();
  }, [attempt, mock]);

  const cards = mock
    ? getStoredMatchRequests(userId).map(({ id, request }) => ({
        id,
        request,
        onClick: () =>
          void navigate(MATCH_REQUEST_RESULTS_PATH, { state: request }),
      }))
    : result?.attempt === attempt
      ? result.cards
      : undefined;

  if (cards === undefined) {
    return (
      <p
        role="status"
        className="typography-label-r-medium m-0 text-(color:--fg-neutral-tertiary)"
      >
        매칭 요청을 불러오는 중이에요.
      </p>
    );
  }

  if (cards === null) {
    return (
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
    );
  }

  if (!cards.length) return null;

  return (
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
  );
}
