import { BottomNav } from "@/components/BottomNav";
import { FAB } from "@/components/FAB";
import { Header } from "@/components/Header";
import { TextButton } from "@/components/TextButton";
import { HomeBanner } from "@/components/home/HomeBanner";
import { RecommendedMatchCarousel } from "@/components/home/RecommendedMatchCarousel";
import {
  RECOMMENDED_MATCHES_MOCK,
  type RecommendedMatch,
} from "@/components/home/recommendedMatches.mock";
import { PageLayout } from "@/components/layout/PageLayout";

// 임시 문구: Figma 빈 상태 문구 확정 전
const EMPTY_MESSAGE =
  "추천할 매치가 아직 없어요.\n조건을 바꾸거나 직접 매치를 찾아보세요.";
const NAV_HREFS = { home: "/", schedule: "/schedule", my: "/my" } as const;

type HomePageProps = {
  matches?: readonly RecommendedMatch[];
};

export default function HomePage({
  matches = RECOMMENDED_MATCHES_MOCK,
}: HomePageProps) {
  const heading = (
    <div className="flex items-center justify-between">
      <h2 className="typography-heading-bold m-0 text-(color:--fg-neutral-default)">
        추천 매치
      </h2>
      <TextButton label="조건 변경" />
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
      {matches.length > 0 ? (
        <div className="flex flex-col gap-4 pt-4 pb-6">
          {heading}
          <RecommendedMatchCarousel matches={matches} />
          <HomeBanner />
        </div>
      ) : (
        <div className="flex flex-col pt-4 pb-6">
          {heading}
          <p className="typography-body-regular m-0 mt-5.5 flex h-30 items-center justify-center text-center whitespace-pre-line text-(color:--fg-neutral-tertiary)">
            {EMPTY_MESSAGE}
          </p>
          <div className="mt-35.5">
            <HomeBanner />
          </div>
        </div>
      )}
    </PageLayout>
  );
}
