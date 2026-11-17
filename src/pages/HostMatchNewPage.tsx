import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BottomCTA } from "@/components/BottomCTA";
import { Header } from "@/components/Header";
import { CourtStep } from "@/components/host-match/CourtStep";
import { MatchInfoStep } from "@/components/host-match/MatchInfoStep";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  initialCourtDraft,
  isCourtDraftReady,
  type CourtDraft,
  type MatchInfoDraft,
} from "@/features/host-match/form";
import { useAuthContext } from "@/hooks/useAuthContext";

const steps = [
  {
    title: "예약한 코트를 알려주세요",
    description: "경기를 진행할 코트에 대한 정보가 필요해요",
  },
  {
    title: "매치 정보를 알려주세요",
    description: "이 조건을 기반으로 매칭이 공개돼요",
  },
];

export default function HostMatchNewPage() {
  const navigate = useNavigate();
  const { authState } = useAuthContext();
  const hostGender =
    authState.status === "authenticated"
      ? authState.user.profile?.gender
      : undefined;
  const [stepIndex, setStepIndex] = useState(0);
  const [matchInfo, setMatchInfo] = useState<MatchInfoDraft>({
    matchFormat: null,
    sameGenderOnly: false,
    maleRecruitCount: 0,
    femaleRecruitCount: 0,
    ntrp: [1, 2],
    preferredAgeGroups: [],
    anyAgeGroup: true,
    fee: "",
  });
  const [court, setCourt] = useState<CourtDraft>(initialCourtDraft);
  const [evidence, setEvidence] = useState<{ file: File; url: string } | null>(
    null,
  );
  const evidenceUrl = evidence?.url ?? null;
  const step = steps[stepIndex];
  const isCourtStep = stepIndex === 0;

  useEffect(() => {
    if (evidenceUrl) return () => URL.revokeObjectURL(evidenceUrl);
  }, [evidenceUrl]);

  return (
    <PageLayout
      header={
        <Header
          variant="subpage"
          title="매치 열기"
          onBack={() => (isCourtStep ? void navigate("/") : setStepIndex(0))}
        />
      }
      footer={
        <div className="[@media(width>480px)]:pb-[max(0px,var(--spacing-padding-large)-env(safe-area-inset-bottom,0px))]">
          {isCourtStep ? (
            <BottomCTA
              primaryAction={{
                children: "코트 등록하기",
                disabled: !isCourtDraftReady(court),
                onClick: () => setStepIndex(1),
              }}
            />
          ) : (
            <div className="pt-(--spacing-padding-medium)">
              <BottomCTA
                layout="horizontal"
                primaryAction={{
                  children: "매칭 시작",
                  onClick: () => void navigate("/schedule"),
                }}
                secondaryAction={{
                  variant: "tertiary",
                  children: "이전",
                  onClick: () => setStepIndex(0),
                }}
              />
            </div>
          )}
        </div>
      }
    >
      <section className="pt-5">
        <h1 className="typography-heading-bold m-0">{step.title}</h1>
        <p className="typography-body-medium m-0 mt-(--spacing-gap-micro) text-(color:--fg-neutral-tertiary)">
          {step.description}
        </p>
      </section>
      {isCourtStep ? (
        <CourtStep
          value={court}
          onChange={setCourt}
          evidenceUrl={evidenceUrl}
          onEvidenceChange={(file) =>
            setEvidence(file ? { file, url: URL.createObjectURL(file) } : null)
          }
        />
      ) : (
        <div className="pb-(--spacing-gap-extra-large)">
          <MatchInfoStep
            value={matchInfo}
            onChange={setMatchInfo}
            hostGender={hostGender}
          />
        </div>
      )}
    </PageLayout>
  );
}
