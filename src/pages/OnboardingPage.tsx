import { useEffect, useRef, useState } from "react";
import { checkNicknameAvailability } from "@/apis/onboarding";
import { BottomCTA } from "@/components/BottomCTA";
import { ProgressBar } from "@/components/ProgressBar";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  BasicProfileStep,
  type BasicProfileDraft,
} from "@/components/onboarding/BasicProfileStep";
import { useAuthContext } from "@/hooks/useAuthContext";

const steps = [
  {
    title: "기본프로필",
    description: "다른 플레이어들이 매칭시 확인할 정보예요",
  },
  { title: "실력", description: "다른 플레이어들이 매칭시 확인할 정보예요" },
  { title: "선호하는 매칭", description: "마이페이지에서 변경 가능" },
];

type NicknameCheckStatus =
  "idle" | "checking" | "available" | "duplicate" | "error";

function getNicknameFormatError(nickname: string) {
  if (nickname.length < 2) return "두 글자 이상 입력해 주세요";
  if (!/^[가-힣A-Za-z0-9]{2,12}$/.test(nickname)) {
    return "한글·영문·숫자로 2~12자 입력해 주세요";
  }
}

export default function OnboardingPage() {
  const { authState } = useAuthContext();
  const [stepIndex, setStepIndex] = useState(0);
  const [defaultNickname] = useState(() =>
    authState.status === "authenticated" ? authState.user.nickname : "",
  );
  const [basicProfile, setBasicProfile] = useState<BasicProfileDraft>(() => ({
    nickname: defaultNickname,
    gender: null,
    ageGroup: null,
  }));
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [nicknameTouched, setNicknameTouched] = useState(false);
  const [nicknameCheck, setNicknameCheck] =
    useState<NicknameCheckStatus>("idle");
  const nicknameRequest = useRef<AbortController | null>(null);

  useEffect(() => () => nicknameRequest.current?.abort(), []);
  useEffect(() => {
    if (!photoPreviewUrl) return;
    return () => URL.revokeObjectURL(photoPreviewUrl);
  }, [photoPreviewUrl]);

  const step = steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  const formatError = getNicknameFormatError(basicProfile.nickname);
  const nicknameChanged = basicProfile.nickname !== defaultNickname;
  const nicknameConfirmed = nicknameCheck === "available";
  const canCheckNickname =
    nicknameChanged && !formatError && !nicknameConfirmed;
  const basicProfileReady = Boolean(
    !formatError &&
    (!nicknameChanged || nicknameConfirmed) &&
    basicProfile.gender &&
    basicProfile.ageGroup,
  );

  function updateBasicProfile(value: BasicProfileDraft) {
    if (value.nickname !== basicProfile.nickname) {
      nicknameRequest.current?.abort();
      nicknameRequest.current = null;
      setNicknameCheck("idle");
    }
    setBasicProfile(value);
  }

  async function checkNickname() {
    if (!canCheckNickname || nicknameRequest.current) return;

    const controller = new AbortController();
    nicknameRequest.current = controller;
    setNicknameCheck("checking");

    try {
      const available = await checkNicknameAvailability(
        basicProfile.nickname,
        controller.signal,
      );
      if (!controller.signal.aborted) {
        setNicknameCheck(available ? "available" : "duplicate");
      }
    } catch {
      if (!controller.signal.aborted) setNicknameCheck("error");
    } finally {
      if (nicknameRequest.current === controller)
        nicknameRequest.current = null;
    }
  }

  const nextAction = {
    children: isLastStep ? "완료" : "다음",
    disabled: isLastStep || (isFirstStep && !basicProfileReady),
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
        {isFirstStep && (
          <BasicProfileStep
            value={basicProfile}
            onChange={updateBasicProfile}
            onNicknameBlur={() => setNicknameTouched(true)}
            onCheckNickname={canCheckNickname ? checkNickname : undefined}
            checkingNickname={nicknameCheck === "checking"}
            nicknameConfirmed={nicknameConfirmed}
            photoPreviewUrl={photoPreviewUrl}
            onSelectPhoto={(file) =>
              setPhotoPreviewUrl(URL.createObjectURL(file))
            }
            nicknameError={
              (nicknameTouched ? formatError : undefined) ??
              (nicknameCheck === "duplicate"
                ? "이미 있는 닉네임이에요."
                : nicknameCheck === "error"
                  ? "닉네임을 확인하지 못했어요. 다시 시도해 주세요."
                  : undefined)
            }
          />
        )}
      </section>
    </PageLayout>
  );
}
