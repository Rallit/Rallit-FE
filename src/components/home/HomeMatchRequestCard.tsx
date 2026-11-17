import { Badge } from "@/components/Badge";
import { Divider } from "@/components/Divider";
import {
  formatRequestSummary,
  type MatchRequestSummary,
} from "@/features/match-request/summary";

type HomeMatchRequestCardProps = {
  request: MatchRequestSummary;
  hasNewMatches?: boolean;
  onClick: () => void;
};

function formatDates(dates: string[]) {
  return dates
    .map((date, index) => {
      const month = date.slice(0, 7);
      const day = Number(date.slice(8, 10));
      const previousMonth = dates[index - 1]?.slice(0, 7);
      return month === previousMonth
        ? `${day}일`
        : `${Number(date.slice(5, 7))}월 ${day}일`;
    })
    .join(", ");
}

export function HomeMatchRequestCard({
  request,
  hasNewMatches,
  onClick,
}: HomeMatchRequestCardProps) {
  const requirements = formatRequestSummary(request);
  return (
    <button
      type="button"
      onClick={onClick}
      className="box-border flex w-full cursor-pointer appearance-none flex-col items-start gap-(--spacing-gap-micro) rounded-(--radius-large) border-0 bg-(--bg-neutral-default) px-(--spacing-padding-large) py-(--spacing-padding-medium) text-left text-(color:--fg-neutral-default)"
    >
      {hasNewMatches && <Badge variant="blue-inverse">새 매치가 있어요</Badge>}
      <span className="typography-body-bold">{formatDates(request.dates)}</span>
      <span className="typography-label-r-medium flex min-h-6 flex-wrap items-center gap-1 text-(color:--fg-neutral-secondary)">
        {requirements.map((requirement, index) => (
          <span key={index} className="inline-flex min-w-0 items-center gap-1">
            {index > 0 && <Divider orientation="vertical" length={16} />}
            <span className="wrap-anywhere">{requirement}</span>
          </span>
        ))}
      </span>
    </button>
  );
}
