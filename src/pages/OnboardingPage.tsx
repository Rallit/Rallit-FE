import { useState } from "react";
import { BottomCTA } from "@/components/BottomCTA";
import { ProgressBar } from "@/components/ProgressBar";
import { PageLayout } from "@/components/layout/PageLayout";

const steps = [
  {
    title: "기본프로필",
    description: "다른 플레이어들이 매칭시 확인할 정보예요",
  },
  { title: "실력", description: "다른 플레이어들이 매칭시 확인할 정보예요" },
  { title: "선호하는 매칭", description: "마이페이지에서 변경 가능" },
];

export default function OnboardingPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  const nextAction = {
    children: isLastStep ? "완료" : "다음",
    disabled: isLastStep,
    onClick: () =>
      setStepIndex((index) => Math.min(index + 1, steps.length - 1)),
  };

  return (
    <PageLayout
      footer={
        <div className="[@media(width>480px)]:pb-[max(0px,var(--spacing-padding-large)-env(safe-area-inset-bottom,0px))]">
          {isFirstStep ? (
            <BottomCTA primaryAction={nextAction} />
          ) : (
            <BottomCTA
              layout="horizontal"
              primaryAction={nextAction}
              secondaryAction={{
                variant: "tertiary",
                children: "이전",
                onClick: () => setStepIndex((index) => Math.max(index - 1, 0)),
              }}
            />
          )}
        </div>
      }
    >
      <ProgressBar
        currentStep={stepIndex + 1}
        totalSteps={steps.length}
        mode="current"
        label="온보딩 진행 단계"
      />

      <section className="mt-(--spacing-gap-extra-large)">
        <div role="status">
          <h1 className="typography-title-bold m-0">{step.title}</h1>
          <p className="typography-body-medium m-0 mt-(--spacing-gap-micro) text-(color:--fg-neutral-tertiary)">
            {step.description}
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
