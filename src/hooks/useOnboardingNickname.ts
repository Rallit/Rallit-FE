import { useEffect, useRef, useState } from "react";
import { checkNicknameAvailability } from "@/apis/onboarding";
import { nicknameMaxLength } from "@/features/onboarding/form";

type CheckStatus = "idle" | "checking" | "available" | "duplicate" | "error";

function getFormatError(nickname: string) {
  if (nickname.length < 2) return "두 글자 이상 입력해 주세요";
  if (
    nickname.length > nicknameMaxLength ||
    /[^가-힣A-Za-z0-9]/.test(nickname)
  ) {
    return "한글·영문·숫자로 2~12자 입력해 주세요";
  }
}

export function useOnboardingNickname(
  nickname: string,
  defaultNickname: string,
) {
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<CheckStatus>("idle");
  const [defaultRejected, setDefaultRejected] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  const formatError = getFormatError(nickname);
  const changed = nickname !== defaultNickname;
  const confirmed = status === "available";
  const duplicate = status === "duplicate";
  const needsCheck = changed || defaultRejected;
  const canCheck = needsCheck && !formatError && !confirmed;

  function resetCheck() {
    request.current?.abort();
    request.current = null;
    setStatus("idle");
  }

  async function check() {
    if (!canCheck || request.current) return;

    const controller = new AbortController();
    request.current = controller;
    setStatus("checking");

    try {
      const available = await checkNicknameAvailability(
        nickname,
        controller.signal,
      );
      if (!controller.signal.aborted) {
        if (!changed) setDefaultRejected(!available);
        setStatus(available ? "available" : "duplicate");
      }
    } catch {
      if (!controller.signal.aborted) setStatus("error");
    } finally {
      if (request.current === controller) request.current = null;
    }
  }

  return {
    ready: !formatError && (!needsCheck || confirmed),
    confirmed,
    checking: status === "checking",
    error:
      (touched ? formatError : undefined) ??
      (duplicate
        ? "이미 있는 닉네임이에요"
        : status === "error"
          ? "닉네임을 확인하지 못했어요. 다시 시도해 주세요."
          : undefined),
    check: canCheck ? check : undefined,
    touch: () => setTouched(true),
    markDuplicate: () => {
      if (!changed) setDefaultRejected(true);
      setStatus("duplicate");
    },
    resetCheck,
  };
}
