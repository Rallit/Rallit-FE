export const INTRO_COPY = {
  service: {
    titleWithName: (name: string) => `${name}님에게 딱 맞는 매치를\n찾아보세요`,
    titleWithoutName: "딱 맞는 매치를\n찾아보세요",
    startLabel: "시작하기",
  },
  complete: {
    title: "Rallit에서 회원 정보를 바탕으로\n매치를 추천해드려요",
  },
} as const;

export const ONBOARDING_COMPLETE_DELAY_MS = 2000;
