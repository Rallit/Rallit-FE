import { ActionButton } from "@/components/ActionButton";
import { BottomNav } from "@/components/BottomNav";
import { FAB } from "@/components/FAB";
import { Header } from "@/components/Header";
import { TextButton } from "@/components/TextButton";
import { HomeMatchRequestCard } from "@/components/home/HomeMatchRequestCard";
import { RecommendedMatchCarousel } from "@/components/home/RecommendedMatchCarousel";
import {
  RECOMMENDED_MATCHES_MOCK,
  type RecommendedMatch,
} from "@/components/home/recommendedMatches.mock";
import { PageLayout } from "@/components/layout/PageLayout";
import type { MatchRequest } from "@/features/match-request/form";
import type { StoredMatchRequest } from "@/features/match-request/storage.web";

const EMPTY_MESSAGE =
  "조건에 맞는 매치가 없어요\n유사한 매치가 나오면 알려드릴게요";
const NAV_HREFS = { home: "/", schedule: "/schedule", my: "/my" } as const;

type HomePageProps = {
  matches?: readonly RecommendedMatch[];
  onRequestMatch?: () => void;
  requests?: readonly StoredMatchRequest[];
  onOpenRequest?: (request: MatchRequest) => void;
};

export default function HomePage({
  matches = RECOMMENDED_MATCHES_MOCK,
  onRequestMatch,
  requests = [],
  onOpenRequest,
}: HomePageProps) {
  const heading = (
    <div className="flex items-center justify-between">
      <h2 className="typography-heading-bold m-0 text-(color:--fg-neutral-default)">
        추천 매치
      </h2>
      <TextButton label="조건 변경" />
    </div>
  );

  const requestPrompt = (
    <div className="flex items-center justify-between gap-(--spacing-gap-medium) rounded-(--radius-large) bg-(--bg-neutral-default) p-(--spacing-padding-medium)">
      <p className="typography-body-bold m-0 text-(color:--fg-neutral-default)">
        내 일정에 딱 맞는 매치
      </p>
      <ActionButton
        variant="tertiary"
        size="S"
        onClick={onRequestMatch}
        className="shrink-0 whitespace-nowrap"
      >
        요청하기
      </ActionButton>
    </div>
  );

  return (
    <PageLayout
      background="weak"
      header={<Header variant="logo" onNotifications={() => {}} />}
      footer={
        <div className="relative">
          <FAB
            label="매치 열기"
            collapsed
            className="absolute right-4 bottom-[calc(100%+16px)]"
          />
          <BottomNav activeTab="home" hrefs={NAV_HREFS} />
        </div>
      }
    >
      <div className="flex flex-col gap-(--spacing-gap-medium) pt-4 pb-6">
        {matches.length > 0 ? (
          <div className="flex flex-col gap-4">
            {heading}
            <RecommendedMatchCarousel matches={matches} />
            <div className="mt-(--spacing-gap-small)">{requestPrompt}</div>
          </div>
        ) : (
          <div className="flex flex-col">
            {heading}
            <p className="typography-body-regular m-0 mt-5 flex h-[236px] items-center justify-center text-center whitespace-pre-line text-(color:--fg-neutral-tertiary)">
              {EMPTY_MESSAGE}
            </p>
            <div className="mt-4">{requestPrompt}</div>
          </div>
        )}
        {requests.length > 0 && onOpenRequest && (
          <ul
            aria-label="매칭 요청 목록"
            className="m-0 grid min-w-0 list-none gap-(--spacing-gap-small) p-0"
          >
            {requests.map(({ id, request }) => (
              <li key={id}>
                <HomeMatchRequestCard
                  request={request}
                  hasNewMatches={import.meta.env.DEV}
                  onClick={() => onOpenRequest(request)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageLayout>
  );
}
