import { Badge } from "@/components/Badge";
import { Divider } from "@/components/Divider";
import participantIcon from "../../assets/icons/match-participant.svg";

type ScheduleMatch = {
  id: number;
  isHost: boolean;
  status: "recruiting" | "confirmed";
  daysUntil?: number;
  timeLabel: string;
  courtName: string;
  participantCount: number;
  capacity: number;
  matchType: string;
};

const sampleMatch = {
  timeLabel: "11시-13시",
  courtName: "장충 테니스장",
  participantCount: 2,
  capacity: 4,
  matchType: "복식",
};

const mockSchedule: { date: string; matches: ScheduleMatch[] }[] = [
  {
    date: "11월 24일",
    matches: [
      {
        ...sampleMatch,
        id: 1,
        isHost: false,
        status: "recruiting",
        daysUntil: 1,
      },
      { ...sampleMatch, id: 2, isHost: true, status: "recruiting" },
    ],
  },
  {
    date: "11월 25일",
    matches: [
      { ...sampleMatch, id: 3, isHost: true, status: "confirmed" },
      {
        ...sampleMatch,
        id: 4,
        isHost: false,
        status: "confirmed",
        daysUntil: 3,
      },
    ],
  },
];

function ScheduleMatchCard({ match }: { match: ScheduleMatch }) {
  const confirmed = match.status === "confirmed";

  return (
    <article className="grid gap-(--spacing-gap-small) rounded-(--radius-large) bg-(--bg-neutral-default) px-(--spacing-padding-large) py-(--spacing-padding-medium)">
      <div className="flex items-center justify-between gap-(--spacing-gap-small)">
        <div className="flex items-center gap-(--spacing-gap-micro)">
          {match.isHost && (
            <Badge variant="blue" fitContent>
              호스트
            </Badge>
          )}
          <Badge variant={confirmed ? "brand" : "neutral"} fitContent>
            {confirmed ? "매치 확정" : "모집중"}
          </Badge>
        </div>
        {match.daysUntil !== undefined && (
          <span
            className={`typography-label-r-bold ${confirmed ? "text-(color:--fg-accent-default)" : "text-(color:--fg-accent-assistive)"}`}
          >
            D-{match.daysUntil}
          </span>
        )}
      </div>
      <div className="grid gap-(--spacing-gap-micro)">
        <h3 className="typography-body-bold m-0">
          {match.timeLabel} {match.courtName}
        </h3>
        <div className="typography-label-r-medium flex items-center gap-(--spacing-gap-small) text-(color:--fg-neutral-secondary)">
          <span className="flex items-center gap-(--spacing-gap-micro)">
            <img src={participantIcon} alt="" />
            <span
              aria-label={`${match.capacity}명 중 ${match.participantCount}명 참여`}
            >
              {match.participantCount}/{match.capacity}
            </span>
          </span>
          <Divider orientation="vertical" length={16} />
          <span className="typography-label-l-regular text-(color:--fg-neutral-tertiary)">
            {match.matchType}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function MatchSchedulePage() {
  return (
    <div className="grid gap-(--spacing-gap-extra-large) pt-(--spacing-padding-medium) pb-12">
      <div
        className="flex items-center gap-(--spacing-gap-micro)"
        aria-label="매치 현황 탭"
      >
        <span
          aria-current="page"
          className="typography-heading-bold p-(--spacing-padding-small)"
        >
          매치현황
        </span>
        <button
          type="button"
          disabled
          className="typography-heading-bold border-0 bg-transparent p-(--spacing-padding-small) text-(color:--fg-neutral-tertiary)"
        >
          신청현황
        </button>
      </div>
      <div className="grid gap-(--spacing-gap-large)">
        {mockSchedule.map(({ date, matches }) => (
          <section key={date}>
            <h2 className="typography-heading-bold m-0 py-(--spacing-padding-small) text-(color:--fg-neutral-secondary)">
              {date}
            </h2>
            <div className="grid gap-(--spacing-gap-small)">
              {matches.map((match) => (
                <ScheduleMatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
