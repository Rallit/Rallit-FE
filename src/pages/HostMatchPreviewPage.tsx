import { useLocation, useNavigate } from "react-router";
import { Badge } from "@/components/Badge";
import { GoalProgress } from "@/components/GoalProgress";
import { Header } from "@/components/Header";
import { PageLayout } from "@/components/layout/PageLayout";
import { Profile } from "@/components/Profile";
import { ProfileCard } from "@/components/ProfileCard";
import type { HostMatchPreviewSummary } from "@/features/host-match/form";
import moreIcon from "../../assets/icons/meatball.svg";
import profilePlaceholder from "../../assets/images/host-applicant-placeholder.png";

const applicants = [
  { id: 1, name: "강민서", gender: "남성" },
  { id: 2, name: "이윤경", gender: "여성" },
  { id: 3, name: "한줄 두줄", gender: "여성" },
];

const applicantDetails = [
  { label: "구력", value: "3년" },
  { label: "NTRP", value: "3.0" },
];

const participants = [
  { id: 1, name: "신청자 A", status: "호스트", isHost: true },
  { id: 2, name: "신청자 A", status: "입금 대기 중", isHost: false },
];

const previewActions = {
  onReject: () => {},
  onAccept: () => {},
  disabled: true,
};

const defaultSummary: HostMatchPreviewSummary = {
  courtName: "장충 테니스장 3번 코트",
  dateTimeLabel: "11/14(토) 14:00 - 16:00",
  current: participants.length,
  capacity: 4,
  status: "recruiting",
};

export default function HostMatchPreviewPage() {
  const navigate = useNavigate();
  const fromSchedule = useLocation().state as HostMatchPreviewSummary | null;
  const summary = fromSchedule ?? defaultSummary;

  return (
    <PageLayout
      header={
        <Header
          variant="subpage"
          title="내가 연 매치"
          onBack={() => {
            if (fromSchedule) {
              void navigate(-1);
            } else {
              void navigate("/schedule", { replace: true });
            }
          }}
          action={{
            icon: moreIcon,
            label: "매치 관리 메뉴",
            disabled: true,
            onClick: () => {},
          }}
        />
      }
    >
      <div className="grid min-w-0 gap-(--spacing-gap-extra-large) pt-3.5 pb-(--spacing-gap-extra-large)">
        <section className="grid gap-(--spacing-gap-large)">
          <div className="grid justify-items-start gap-(--spacing-gap-medium)">
            <Badge fitContent>
              {summary.status === "confirmed" ? "매치 확정" : "모집중"}
            </Badge>
            <div className="grid gap-(--spacing-gap-micro)">
              <h2 className="typography-heading-bold m-0">
                {summary.courtName}
              </h2>
              <p className="typography-body-medium m-0 text-(color:--fg-neutral-secondary)">
                {summary.dateTimeLabel}
              </p>
            </div>
          </div>
          <GoalProgress current={summary.current} goal={summary.capacity} />
        </section>

        <section className="grid min-w-0 gap-(--spacing-gap-large)">
          <h2 className="typography-headline-bold m-0">
            새 신청 {applicants.length}
          </h2>
          <div className="-mx-(--unit-16) flex snap-x gap-(--spacing-gap-small) overflow-x-auto px-(--unit-16) scrollbar-none">
            {applicants.map(({ id, name, gender }) => (
              <div
                key={id}
                className="shrink-0 snap-start scroll-ml-(--unit-16)"
              >
                <ProfileCard
                  name={name}
                  imageSrc={profilePlaceholder}
                  badge={gender}
                  details={applicantDetails}
                  actions={previewActions}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-(--spacing-gap-large)">
          <h2 className="typography-headline-bold m-0">
            참가자 {participants.length}
          </h2>
          <ul className="m-0 grid list-none gap-(--spacing-gap-small) p-0">
            {participants.map(({ id, name, status, isHost }) => (
              <li
                key={id}
                className="flex items-center justify-between gap-(--spacing-gap-small)"
              >
                <div className="flex min-w-0 items-center gap-(--spacing-gap-medium)">
                  <Profile src={profilePlaceholder} size="S" />
                  <div className="grid gap-(--spacing-gap-micro)">
                    <p className="typography-label-l-medium m-0">{name}</p>
                    <p className="typography-caption-r-medium m-0 text-(color:--fg-neutral-tertiary)">
                      NTRP 3.0, 2년
                    </p>
                  </div>
                </div>
                <Badge variant={isHost ? "brand" : "neutral"} fitContent>
                  {status}
                </Badge>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-label="코트 검수 상태"
          className="flex items-start justify-between gap-(--spacing-gap-small) rounded-(--radius-small) bg-(--bg-neutral-weak) px-(--spacing-padding-extra-large) py-(--spacing-padding-large)"
        >
          <div className="grid gap-(--spacing-gap-micro)">
            <h2 className="typography-label-r-bold m-0">OO테니스장 3번 코트</h2>
            <p className="typography-caption-r-medium m-0 text-(color:--fg-neutral-tertiary)">
              11/14(토) 14:00–16:00
            </p>
          </div>
          <Badge fitContent>검수 대기</Badge>
        </section>
      </div>
    </PageLayout>
  );
}
