import { useEffect, useRef, useState } from "react";
import spinnerIcon from "../../../assets/icons/spinner.svg";
import { ApiError } from "@/apis/client";
import { applyToMatch } from "@/apis/matches";
import type { MatchDetail } from "@/apis/matches.types";
import { BottomCTA } from "@/components/BottomCTA";
import { BottomSheet } from "@/components/BottomSheet";
import { Checkbox } from "@/components/Checkbox";
import { SummaryBox } from "@/components/SummaryBox";
import {
  FREE_CANCEL_NOTICE,
  REFUND_POLICY,
} from "@/features/match-detail/copy";
import {
  formatMatchDate,
  formatMatchTypes,
  formatTimeRange,
} from "@/features/match-detail/format";

type ApplySheetProps = {
  match: MatchDetail;
  onClose: () => void;
  onApplied: () => void;
};

export function ApplySheet({ match, onClose, onApplied }: ApplySheetProps) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const request = useRef<AbortController>(null);

  useEffect(() => () => request.current?.abort(), []);

  async function submit(dismiss: (onConfirm?: () => void) => void) {
    if (submitting) return;
    setSubmitting(true);
    setError(undefined);
    const controller = new AbortController();
    request.current = controller;
    try {
      await applyToMatch(match.matchId, controller.signal);
      dismiss(onApplied);
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(
        cause instanceof ApiError && cause.kind === "api"
          ? cause.message
          : "신청하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      if (request.current === controller) request.current = null;
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet
      id="match-apply-sheet"
      title="참가 신청"
      open
      onDismiss={onClose}
    >
      {(dismiss) => (
        <>
          <div className="flex flex-col gap-(--spacing-gap-large) px-(--spacing-padding-large) py-(--spacing-padding-medium)">
            {/* 임시: API에 구 정보가 없어 장소에 코트명을 표시합니다. */}
            <SummaryBox
              date={formatMatchDate(match.startsAt)}
              time={formatTimeRange(match.startsAt, match.endsAt)}
              regionLabel="장소"
              region={match.court.name}
              matchType={formatMatchTypes(match.matchTypes)}
            />
            <section className="flex flex-col gap-(--spacing-gap-medium)">
              <h3 className="typography-label-r-medium m-0 text-(color:--fg-neutral-default)">
                취소, 환불 규정
              </h3>
              <p className="typography-label-r-regular m-0 text-(color:--fg-neutral-secondary)">
                {[...REFUND_POLICY, FREE_CANCEL_NOTICE].map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <label className="flex w-fit cursor-pointer items-center gap-(--spacing-gap-micro)">
                <Checkbox
                  checked={agreed}
                  disabled={submitting}
                  onChange={(event) => setAgreed(event.currentTarget.checked)}
                />
                <span className="typography-label-r-medium text-(color:--fg-neutral-secondary)">
                  취소·환불 규정을 확인했어요 (필수)
                </span>
              </label>
            </section>
            {error && (
              <p
                role="alert"
                className="typography-label-r-medium m-0 text-(color:--fg-system-error)"
              >
                {error}
              </p>
            )}
          </div>
          <div className="pt-(--spacing-padding-large)">
            <BottomCTA
              layout="horizontal"
              secondaryAction={{
                variant: "tertiary",
                children: "취소",
                disabled: submitting,
                onClick: () => dismiss(),
              }}
              primaryAction={{
                children: submitting ? (
                  <img
                    src={spinnerIcon}
                    alt=""
                    width={32}
                    height={32}
                    className="animate-spin"
                  />
                ) : (
                  "신청하기"
                ),
                "aria-label": submitting ? "신청 중" : undefined,
                "aria-busy": submitting,
                disabled: !agreed,
                onClick: () => void submit(dismiss),
              }}
            />
          </div>
        </>
      )}
    </BottomSheet>
  );
}
