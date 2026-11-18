import { useEffect, useEffectEvent } from "react";
import { IntroScreen } from "./IntroScreen";
import { INTRO_COPY, ONBOARDING_COMPLETE_DELAY_MS } from "./introCopy";

type OnboardingCompleteProps = {
  onDone: () => void;
};

export function OnboardingComplete({ onDone }: OnboardingCompleteProps) {
  const handleDone = useEffectEvent(onDone);

  useEffect(() => {
    const timer = setTimeout(handleDone, ONBOARDING_COMPLETE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return <IntroScreen title={INTRO_COPY.complete.title} />;
}
