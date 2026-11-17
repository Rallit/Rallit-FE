import { Navigate, useLocation, useNavigate } from "react-router";
import closeIcon from "../../assets/icons/close.svg";
import { ActionButton } from "@/components/ActionButton";
import completionImage from "../../assets/images/match-request-placeholder.png";
import { IconButton } from "@/components/IconButton";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  MATCH_REQUEST_PATH,
  MATCH_REQUEST_RESULTS_PATH,
  matchFormats,
  savedMatchRequestResultsPath,
} from "@/features/match-request/form";
import type { MatchRequestCompletion } from "@/features/match-request/submission";
import {
  formatMatchDate,
  formatMatchTimeRange,
} from "@/features/match-request/summary";

export default function MatchRequestCompletePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const completion = state as MatchRequestCompletion | null;

  if (!completion?.request) return <Navigate to={MATCH_REQUEST_PATH} replace />;

  const { request, saved } = completion;

  const summary = [
    ["날짜", request.dates.map((date) => formatMatchDate(date)).join(", ")],
    ["시간", formatMatchTimeRange(request)],
    ["지역", request.activityAreas.map(({ label }) => label).join(", ")],
    [
      "유형",
      matchFormats
        .filter(({ value }) => request.matchFormats.includes(value))
        .map(({ label }) => label)
        .join(", "),
    ],
  ];
  if (saved) summary.push(["딱 맞는 매치", `${saved.exactMatchCount}개`]);

  return (
    <PageLayout
      header={
        <header className="flex h-14 items-center px-(--spacing-padding-large)">
          <IconButton
            aria-label="닫기"
            icon={closeIcon}
            className="-ml-2.5"
            onClick={() => void navigate("/", { replace: true })}
          />
        </header>
      }
    >
      <div className="pt-[54px] pb-(--spacing-padding-large)">
        <img
          src={completionImage}
          alt=""
          width={140}
          height={140}
          className="mx-auto block size-35 object-cover"
        />
        <h1 className="typography-title-bold m-0 mt-5 text-center text-(color:--fg-neutral-strong)">
          매칭을 요청했어요
        </h1>
        <p className="typography-body-regular m-0 mt-2 text-center">
          조건에 맞는 매치가 열리면
          <br />
          알림으로 알려드릴게요
        </p>

        <dl className="m-0 mt-5 grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-(--spacing-gap-large) gap-y-(--spacing-gap-medium) rounded-(--radius-medium) bg-(--bg-neutral-weak) p-(--spacing-padding-large)">
          {summary.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="typography-label-r-medium text-(color:--fg-neutral-tertiary)">
                {label}
              </dt>
              <dd className="typography-body-medium m-0 wrap-anywhere text-(color:--fg-neutral-secondary)">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        {(saved === null || saved.hasResults) && (
          <ActionButton
            size="M"
            fullWidth
            className="mt-5"
            onClick={() => {
              if (saved)
                void navigate(
                  savedMatchRequestResultsPath(saved.request.requestId),
                );
              else
                void navigate(MATCH_REQUEST_RESULTS_PATH, { state: request });
            }}
          >
            열려있는 매치 확인하기
          </ActionButton>
        )}
      </div>
    </PageLayout>
  );
}
