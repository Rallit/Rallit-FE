import { BottomCTA } from "@/components/BottomCTA";
import { IntroScreen } from "./IntroScreen";
import { INTRO_COPY } from "./introCopy";

type ServiceIntroProps = {
  displayName: string | null;
  onStart: () => void;
};

export function ServiceIntro({ displayName, onStart }: ServiceIntroProps) {
  const name = displayName?.trim();
  const title = name
    ? INTRO_COPY.service.titleWithName(name)
    : INTRO_COPY.service.titleWithoutName;

  return (
    <IntroScreen
      title={title}
      footer={
        <BottomCTA
          primaryAction={{
            children: INTRO_COPY.service.startLabel,
            onClick: onStart,
          }}
        />
      }
    />
  );
}
