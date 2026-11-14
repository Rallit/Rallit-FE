import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { ApiError } from "@/apis/client";
import { getOnboardingUser, submitOnboarding } from "@/apis/onboarding";
import { BottomCTA } from "@/components/BottomCTA";
import { ProgressBar } from "@/components/ProgressBar";
import { OnboardingComplete } from "@/components/intro/OnboardingComplete";
import { PageLayout } from "@/components/layout/PageLayout";
import { BasicProfileStep } from "@/components/onboarding/BasicProfileStep";
import { MatchPreferencesStep } from "@/components/onboarding/MatchPreferencesStep";
import { SkillStep } from "@/components/onboarding/SkillStep";
import {
  buildOnboardingRequest,
  getOnboardingFieldError,
  isMatchPreferencesReady,
  type BasicProfileDraft,
  type MatchPreferencesDraft,
  type OnboardingFieldError,
  type SkillDraft,
} from "@/features/onboarding/form";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useOnboardingNickname } from "@/hooks/useOnboardingNickname";
import { useOnboardingProfilePhoto } from "@/hooks/useOnboardingProfilePhoto";

const steps = [
  {
    title: "기본프로필",
    description: "다른 플레이어들이 매칭시 확인할 정보예요",
  },
  { title: "실력" },
  { title: "선호하는 매칭", description: "마이페이지에서 변경 가능" },
];

export default function OnboardingPage() {
  const { authState, completeLogin } = useAuthContext();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [defaultNickname] = useState(() =>
    authState.status === "authenticated" ? authState.user.nickname : "",
  );
  const [basicProfile, setBasicProfile] = useState<BasicProfileDraft>(() => ({
    nickname: defaultNickname,
    gender: null,
    ageGroup: null,
  }));
  const [skill, setSkill] = useState<SkillDraft>({
    tennisStart: null,
    ntrp: "2.0",
  });
  const [matchPreferences, setMatchPreferences] =
    useState<MatchPreferencesDraft>({
      activityAreas: [],
      sameGenderOnly: false,
      preferredMatchTypes: [],
      preferredTimeSlots: [],
    });
  const [completedUserId, setCompletedUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<OnboardingFieldError | null>(
    null,
  );
  const submitRequest = useRef<AbortController | null>(null);
  const profilePhoto = useOnboardingProfilePhoto(
    authState.status === "authenticated"
      ? (authState.user.profileImageUrl ?? null)
      : null,
    (profileImageUrl) => {
      if (authState.status === "authenticated") {
        completeLogin({ ...authState.user, profileImageUrl });
      }
    },
  );
  const nickname = useOnboardingNickname(
    basicProfile.nickname,
    defaultNickname,
  );

  useEffect(() => () => submitRequest.current?.abort(), []);

  const step = steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isSkillStep = stepIndex === 1;
  const isLastStep = stepIndex === steps.length - 1;

  const basicProfileReady =
    nickname.ready && Boolean(basicProfile.gender && basicProfile.ageGroup);
  const matchPreferencesReady = isMatchPreferencesReady(matchPreferences);

  function updateBasicProfile(value: BasicProfileDraft) {
    setSubmitError(null);
    if (value.nickname !== basicProfile.nickname) nickname.resetCheck();
    setBasicProfile(value);
  }

  async function submit() {
    if (
      authState.status !== "authenticated" ||
      submitRequest.current ||
      !nickname.ready
    )
      return;

    const payload = buildOnboardingRequest(
      basicProfile,
      skill,
      matchPreferences,
    );
    if (!payload) return;

    const user = authState.user;
    const controller = new AbortController();
    const { signal } = controller;
    submitRequest.current = controller;
    setIsSubmitting(true);
    setSubmitError(null);

    function finish(saved: typeof user) {
      setCompletedUserId(saved.id);
      completeLogin(saved);
    }

    try {
      const saved = await submitOnboarding(payload, user, signal);
      if (!signal.aborted) finish(saved);
    } catch (error) {
      if (signal.aborted) return;

      if (error instanceof ApiError && error.status === 409) {
        if (error.message === "이미 사용 중인 닉네임입니다.") {
          nickname.markDuplicate();
          setStepIndex(0);
          return;
        }

        try {
          const current = await getOnboardingUser(signal);
          if (signal.aborted) return;
          if (current.id === user.id && current.onboardingCompleted) {
            finish(current);
            return;
          }
        } catch {
          if (signal.aborted) return;
        }
      }

      const fieldError =
        error instanceof ApiError && error.status === 400
          ? getOnboardingFieldError(error.result)
          : undefined;
      if (fieldError) setStepIndex(fieldError.step);
      setSubmitError(
        fieldError ?? {
          step: steps.length - 1,
          message: "온보딩을 저장하지 못했어요. 다시 시도해 주세요.",
        },
      );
    } finally {
      if (submitRequest.current === controller) submitRequest.current = null;
      if (!signal.aborted) setIsSubmitting(false);
    }
  }

  const nextAction = {
    children: isLastStep ? (isSubmitting ? "저장 중" : "완료") : "다음",
    disabled:
      isSubmitting ||
      (isLastStep && !matchPreferencesReady) ||
      (isFirstStep && (!basicProfileReady || profilePhoto.isUploading)) ||
      (isSkillStep && !skill.tennisStart),
    onClick: () => {
      if (isLastStep) {
        void submit();
        return;
      }
      setStepIndex((index) => Math.min(index + 1, steps.length - 1));
    },
  };

  if (
    authState.status === "authenticated" &&
    authState.user.onboardingCompleted
  ) {
    return completedUserId === authState.user.id ? (
      <OnboardingComplete
        onDone={() => void navigate("/", { replace: true })}
      />
    ) : (
      <Navigate to="/" replace />
    );
  }

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
                disabled: isSubmitting,
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
            {isSkillStep
              ? `${basicProfile.nickname}께 맞는 매치를 추천해 드릴게요`
              : step.description}
          </p>
        </div>
        {isFirstStep && (
          <BasicProfileStep
            value={basicProfile}
            onChange={updateBasicProfile}
            onNicknameBlur={nickname.touch}
            onCheckNickname={nickname.check}
            checkingNickname={nickname.checking}
            nicknameConfirmed={nickname.confirmed}
            photoUrl={profilePhoto.photoUrl}
            uploadingPhoto={profilePhoto.isUploading}
            photoUploadError={profilePhoto.uploadError}
            onSelectPhoto={(file) => void profilePhoto.selectPhoto(file)}
            nicknameError={nickname.error}
          />
        )}
        {isSkillStep && (
          <SkillStep
            value={skill}
            onChange={(value) => {
              setSubmitError(null);
              setSkill(value);
            }}
          />
        )}
        {isLastStep && (
          <fieldset
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="m-0 min-w-0 border-0 p-0"
          >
            <MatchPreferencesStep
              value={matchPreferences}
              onChange={(value) => {
                setSubmitError(null);
                setMatchPreferences(value);
              }}
            />
          </fieldset>
        )}
        {submitError?.step === stepIndex && (
          <p
            role="alert"
            className="typography-body-regular m-0 mb-(--spacing-padding-large) text-(color:--fg-system-error)"
          >
            {submitError.message}
          </p>
        )}
      </section>
    </PageLayout>
  );
}
