import { Navigate, useLocation, useNavigate } from "react-router";
import { Divider } from "@/components/Divider";
import { Header } from "@/components/Header";
import { MatchCard } from "@/components/MatchCard";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  MATCH_REQUEST_PATH,
  type MatchRequest,
} from "@/features/match-request/form";
import {
  formatMatchDate,
  formatMatchTimeRange,
} from "@/features/match-request/summary";
import { getMockMatchRequestResults } from "@/mocks/matchRequestResults";

export default function MatchRequestResultsPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const request = state as MatchRequest | null;

  if (!request) return <Navigate to={MATCH_REQUEST_PATH} replace />;

  const [firstDate, ...otherDates] = request.dates;
  const [area, ...otherAreas] = request.activityAreas;
  const summary = [
    formatMatchDate(firstDate) +
      (otherDates.length ? ` 외 ${otherDates.length}` : ""),
    formatMatchTimeRange(request),
    area.label + (otherAreas.length ? ` 외 ${otherAreas.length}` : ""),
  ];
  const sections = getMockMatchRequestResults(request);

  return (
    <PageLayout
      background="weak"
      header={
        <Header
          variant="subpage"
          title="이미 열린 매치 목록"
          onBack={() => void navigate(-1)}
        />
      }
    >
      <div className="grid gap-12 pt-[23px] pb-6">
        {sections.map((section, index) => (
          <section key={section.title} aria-label={section.title}>
            <h2 className="typography-heading-bold m-0">{section.title}</h2>
            {index === 0 && (
              <div className="typography-body-medium mt-1 flex flex-wrap items-center gap-1 text-(color:--fg-neutral-secondary)">
                {summary.map((part, partIndex) => (
                  <div
                    key={partIndex}
                    className="flex min-w-0 items-center gap-1"
                  >
                    {partIndex > 0 && (
                      <Divider orientation="vertical" length={16} />
                    )}
                    <span className="wrap-anywhere">{part}</span>
                  </div>
                ))}
              </div>
            )}
            <ul className="m-0 mt-5 grid list-none gap-(--spacing-gap-small) p-0">
              {section.matches.map(({ id, ...match }) => (
                <li key={id}>
                  <MatchCard variant="list" {...match} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageLayout>
  );
}
