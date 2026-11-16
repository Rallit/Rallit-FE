import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import trashIcon from "../../assets/icons/trash.svg";
import courtPlaceholder from "../../assets/images/match-request-placeholder.png";
import { ApiError } from "@/apis/client";
import { getActivityAreas } from "@/apis/locations";
import {
  getMatchRequestResults,
  getSavedMatchRequest,
  type MatchRequestResults,
} from "@/apis/matchRequests";
import type {
  RecommendedMatchItem,
  RecommendedMatchesPage,
} from "@/apis/matches.types";
import { ActionButton } from "@/components/ActionButton";
import { Divider } from "@/components/Divider";
import { Header } from "@/components/Header";
import { MatchCard } from "@/components/MatchCard";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  formatMatchStart,
  formatMatchTypes,
  formatNtrpRange,
} from "@/features/match-detail/format";
import {
  MATCH_REQUEST_PATH,
  type MatchRequest,
} from "@/features/match-request/form";
import {
  formatRequestSummary,
  toSavedMatchRequestSummary,
  type MatchRequestSummary,
} from "@/features/match-request/summary";
import { getMockMatchRequestResults } from "@/mocks/matchRequestResults";
import { authMode } from "@/platform/authConfig.web";

type ResultCard = Omit<
  Extract<ComponentProps<typeof MatchCard>, { variant: "list" }>,
  "variant"
> & { id: number | string };

type PageLoader = (
  page: number,
  signal: AbortSignal,
) => Promise<RecommendedMatchesPage>;

type SavedResults = {
  request: MatchRequestSummary;
  matches: MatchRequestResults;
};

const sectionLabels = [
  { key: "exactMatches", title: "딱 맞는 매치", query: "exactPage" },
  { key: "similarMatches", title: "비슷한 매치", query: "similarPage" },
] as const;

function toResultCard(
  { match, areaCode, areaName }: RecommendedMatchItem,
  request: MatchRequestSummary,
): ResultCard {
  return {
    id: match.matchId,
    href: `/matches/${match.matchId}`,
    dateLabel: formatMatchStart(match.startsAt),
    courtName: match.courtName,
    matchType: formatMatchTypes(match.matchTypes),
    skillLevel: formatNtrpRange(match.minNtrp, match.maxNtrp),
    price: match.participationFee,
    participantCount: match.currentParticipantCount,
    capacity: match.capacity,
    courtImage: courtPlaceholder,
    recruitmentLabel:
      match.matchStatus === "RECRUITING" ? "모집중" : "모집 마감",
    region: areaName,
    regionMatches: request.activityAreas.some(({ id }) => id === areaCode),
  };
}

function ResultSection({
  title,
  summary,
  initialCards,
  firstPage,
  loadPage,
  request,
}: {
  title: string;
  summary?: string[];
  initialCards: ResultCard[];
  firstPage?: RecommendedMatchesPage;
  loadPage?: PageLoader;
  request?: MatchRequestSummary;
}) {
  const [page, setPage] = useState(firstPage);
  const [cards, setCards] = useState(initialCards);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const pending = useRef<AbortController | null>(null);

  useEffect(() => () => pending.current?.abort(), []);

  async function loadMore() {
    if (!page?.hasNext || !loadPage || !request || pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setLoading(true);
    setError(undefined);
    try {
      const next = await loadPage(page.page + 1, controller.signal);
      if (controller.signal.aborted) return;
      const nextCards = next.items.map((item) => toResultCard(item, request));
      setPage(next);
      setCards((previous) => [
        ...new Map(
          [...previous, ...nextCards].map((card) => [card.id, card]),
        ).values(),
      ]);
    } catch (error) {
      if (!controller.signal.aborted) {
        if (
          error instanceof ApiError &&
          error.code === "MATCH_PAGE_OUT_OF_RANGE"
        ) {
          setPage({ ...page, hasNext: false });
          return;
        }
        if (error instanceof ApiError && error.status === 404) {
          setPage({ ...page, hasNext: false });
        }
        setError(
          error instanceof ApiError && error.status === 404
            ? "매칭 요청을 찾을 수 없어요. 홈에서 활성 요청을 확인해 주세요."
            : "다음 매치를 불러오지 못했어요.",
        );
      }
    } finally {
      pending.current = null;
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <section aria-label={title}>
      <h2 className="typography-heading-bold m-0">{title}</h2>
      {summary && (
        <div className="typography-body-medium mt-1 flex flex-wrap items-center gap-1 text-(color:--fg-neutral-secondary)">
          {summary.map((part, index) => (
            <div key={index} className="flex min-w-0 items-center gap-1">
              {index > 0 && <Divider orientation="vertical" length={16} />}
              <span className="wrap-anywhere">{part}</span>
            </div>
          ))}
        </div>
      )}
      {cards.length ? (
        <ul className="m-0 mt-5 grid list-none gap-(--spacing-gap-small) p-0">
          {cards.map(({ id, ...card }) => (
            <li key={id}>
              <MatchCard variant="list" {...card} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="typography-label-r-medium mt-5 text-(color:--fg-neutral-tertiary)">
          {title}가 없어요.
        </p>
      )}
      {error && (
        <p role="alert" className="typography-label-r-medium mt-4">
          {error}
        </p>
      )}
      {page?.hasNext && (
        <ActionButton
          variant="tertiary"
          size="S"
          className="mt-4"
          disabled={loading}
          aria-busy={loading}
          onClick={() => void loadMore()}
        >
          {loading ? "불러오는 중" : error ? "다시 시도" : "더 보기"}
        </ActionButton>
      )}
    </section>
  );
}

function SavedResultsContent({ requestId }: { requestId: number }) {
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(0);
  const [response, setResponse] = useState<{
    attempt: number;
    data?: SavedResults;
    notFound?: boolean;
  }>();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      getSavedMatchRequest(requestId, signal),
      getMatchRequestResults(requestId, signal),
      getActivityAreas(signal),
    ])
      .then(([request, matches, areas]) => ({
        request: toSavedMatchRequestSummary(request, areas),
        matches,
      }))
      .then(
        (data) => {
          if (!signal.aborted) setResponse({ attempt, data });
        },
        (error) => {
          if (!signal.aborted) {
            setResponse({
              attempt,
              notFound: error instanceof ApiError && error.status === 404,
            });
            controller.abort();
          }
        },
      );
    return () => controller.abort();
  }, [requestId, attempt]);

  const current = response?.attempt === attempt ? response : undefined;
  if (!current) return <p role="status">매치를 불러오는 중이에요.</p>;
  if (!current.data) {
    return (
      <div className="grid justify-items-start gap-3">
        <p role="alert" className="m-0">
          {current.notFound
            ? "매칭 요청을 찾을 수 없어요."
            : "매칭 결과를 불러오지 못했어요."}
        </p>
        <ActionButton
          variant="tertiary"
          size="S"
          onClick={() =>
            current.notFound
              ? void navigate("/", { replace: true })
              : setAttempt((count) => count + 1)
          }
        >
          {current.notFound ? "홈으로 가기" : "다시 시도"}
        </ActionButton>
      </div>
    );
  }

  const { request, matches } = current.data;
  return sectionLabels.map(({ key, title, query }, index) => (
    <ResultSection
      key={key}
      title={title}
      summary={index === 0 ? formatRequestSummary(request) : undefined}
      firstPage={matches[key]}
      initialCards={matches[key].items.map((match) =>
        toResultCard(match, request),
      )}
      request={request}
      loadPage={async (page, signal) =>
        (await getMatchRequestResults(requestId, signal, { [query]: page }))[
          key
        ]
      }
    />
  ));
}

export default function MatchRequestResultsPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { requestId } = useParams();
  const mock = authMode === "mock";
  const draft = mock ? (state as MatchRequest | null) : null;
  const id = Number(requestId);

  if (
    mock
      ? !draft
      : !Number.isSafeInteger(id) || id <= 0 || !/^\d+$/.test(requestId ?? "")
  ) {
    return <Navigate to={MATCH_REQUEST_PATH} replace />;
  }

  function goBack() {
    const historyIndex = (window.history.state as { idx?: number } | null)?.idx;
    if (historyIndex) void navigate(-1);
    else void navigate("/");
  }

  return (
    <PageLayout
      background="weak"
      header={
        <Header
          variant="subpage"
          title="열린 매치"
          onBack={goBack}
          action={
            draft
              ? { icon: trashIcon, label: "매칭 요청 삭제", onClick: () => {} }
              : undefined
          }
        />
      }
    >
      <div className="grid gap-12 pt-[23px] pb-6">
        {draft ? (
          getMockMatchRequestResults(draft).map(({ title, matches }, index) => (
            <ResultSection
              key={title}
              title={title}
              summary={index === 0 ? formatRequestSummary(draft) : undefined}
              initialCards={matches}
            />
          ))
        ) : (
          <SavedResultsContent key={id} requestId={id} />
        )}
      </div>
    </PageLayout>
  );
}
