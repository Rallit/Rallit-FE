import { useEffect, useState } from "react";
import { getRecommendedMatches } from "@/apis/matches";
import { ActionButton } from "@/components/ActionButton";
import { TextButton } from "@/components/TextButton";
import { HomeMatchRequestList } from "@/components/home/HomeMatchRequestList";
import { RecommendedMatchCarousel } from "@/components/home/RecommendedMatchCarousel";
import { RECOMMENDED_MATCHES_MOCK } from "@/components/home/recommendedMatches.mock";
import {
  toRecommendedMatch,
  type RecommendedMatch,
} from "@/features/home/recommendations";
import { authMode } from "@/platform/authConfig.web";

const EMPTY_MESSAGE =
  "조건에 맞는 매치가 없어요\n유사한 매치가 나오면 알려드릴게요";

type HomePageProps = {
  matches?: readonly RecommendedMatch[];
  onRequestMatch?: () => void;
  userId: number;
};

export default function HomePage({
  matches: suppliedMatches,
  onRequestMatch,
  userId,
}: HomePageProps) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    attempt: number;
    matches: RecommendedMatch[] | null;
  }>();
  const localMatches =
    suppliedMatches ??
    (authMode === "mock" ? RECOMMENDED_MATCHES_MOCK : undefined);

  useEffect(() => {
    if (localMatches) return;

    const controller = new AbortController();
    getRecommendedMatches({ page: 0, size: 5 }, controller.signal)
      .then(({ items }) => items.map(toRecommendedMatch))
      .then(
        (matches) => {
          if (!controller.signal.aborted) setResult({ attempt, matches });
        },
        () => {
          if (!controller.signal.aborted) setResult({ attempt, matches: null });
        },
      );

    return () => controller.abort();
  }, [attempt, localMatches]);

  const matches =
    localMatches ?? (result?.attempt === attempt ? result.matches : undefined);
  const showEmpty = matches?.length === 0;
  const heading = (
    <div className="flex items-center justify-between">
      <h2 className="typography-heading-bold m-0 text-(color:--fg-neutral-default)">
        추천 매치
      </h2>
      <TextButton label="조건 변경" />
    </div>
  );

  return (
    <div className="flex flex-col gap-(--spacing-gap-medium) pt-4 pb-6">
      {!showEmpty ? (
        <div className="flex flex-col gap-4">
          {heading}
          {matches === undefined ? (
            <p
              role="status"
              className="typography-body-regular m-0 py-6 text-center text-(color:--fg-neutral-tertiary)"
            >
              추천 매치를 불러오는 중이에요.
            </p>
          ) : matches === null ? (
            <div className="flex flex-col items-center gap-(--spacing-gap-small) py-6">
              <p
                role="alert"
                className="typography-body-regular m-0 text-center text-(color:--fg-neutral-tertiary)"
              >
                추천 매치를 불러오지 못했어요.
              </p>
              <ActionButton
                variant="tertiary"
                size="S"
                onClick={() => setAttempt((count) => count + 1)}
              >
                다시 시도
              </ActionButton>
            </div>
          ) : (
            <RecommendedMatchCarousel matches={matches} />
          )}
        </div>
      ) : (
        <div className="flex flex-col">
          {heading}
          <p className="typography-body-regular m-0 mt-5 flex h-[236px] items-center justify-center text-center whitespace-pre-line text-(color:--fg-neutral-tertiary)">
            {EMPTY_MESSAGE}
          </p>
        </div>
      )}
      <HomeMatchRequestList
        key={userId}
        userId={userId}
        onRequestMatch={onRequestMatch}
        promptSpacing={showEmpty ? "mt-1" : "mt-3"}
      />
    </div>
  );
}
