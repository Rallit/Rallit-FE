import { Navigate, useLocation, useNavigate } from "react-router";
import closeIcon from "../../assets/icons/close.svg";
import completionImage from "../../assets/images/match-request-complete.png";
import { IconButton } from "@/components/IconButton";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  MATCH_REQUEST_PATH,
  matchFormats,
  type MatchRequest,
} from "@/features/match-request/form";

const weekdayFormat = new Intl.DateTimeFormat("ko-KR", { weekday: "short" });

function formatDate(date: string) {
  const selected = new Date(date + "T00:00:00");
  return `${selected.getMonth() + 1}.${selected.getDate()}(${weekdayFormat.format(selected)})`;
}

function formatHour(hour: number) {
  return String(hour).padStart(2, "0") + ":00";
}

export default function MatchRequestCompletePage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const request = state as MatchRequest | null;

  if (!request) return <Navigate to={MATCH_REQUEST_PATH} replace />;

  const summary = [
    ["날짜", request.dates.map(formatDate).join(", ")],
    [
      "시간",
      `${formatHour(request.startHour)} - ${formatHour(request.endHour)}`,
    ],
    ["지역", request.activityAreas.map(({ label }) => label).join(", ")],
    [
      "유형",
      matchFormats
        .filter(({ value }) => request.matchFormats.includes(value))
        .map(({ label }) => label)
        .join(", "),
    ],
  ];

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
      <div className="pt-[68px] pb-(--spacing-padding-large)">
        <img
          src={completionImage}
          alt=""
          width={128}
          height={128}
          className="mx-auto block size-32 object-cover"
        />
        <h1 className="typography-title-bold m-0 mt-5 text-center text-(color:--fg-neutral-strong)">
          매칭을 요청했어요
        </h1>
        <p className="typography-body-regular m-0 mt-4 text-center">
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
      </div>
    </PageLayout>
  );
}
