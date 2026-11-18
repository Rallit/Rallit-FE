import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import clockIcon from "../../assets/icons/clock.svg";
import participantIcon from "../../assets/icons/match-participant.svg";
import parkingIcon from "../../assets/icons/parking.svg";
import showerIcon from "../../assets/icons/shower.svg";
import { getMatchDetail } from "@/apis/matches";
import type { MatchDetail } from "@/apis/matches.types";
import { ActionButton } from "@/components/ActionButton";
import { Badge } from "@/components/Badge";
import { Divider } from "@/components/Divider";
import { Header } from "@/components/Header";
import { useSignedImage } from "@/hooks/useSignedImage";
import { ProfileCard } from "@/components/ProfileCard";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  formatDeadline,
  formatExperience,
  formatMatchStart,
  formatMatchTypes,
  formatNtrpRange,
  formatPrice,
} from "@/features/match-detail/format";
import { Toast } from "@/components/Toast";
import { ApplySheet } from "@/components/match-detail/ApplySheet";
import {
  APPLIED_TOAST,
  REFUND_POLICY,
  applicationBlockLabels,
} from "@/features/match-detail/copy";

const HEADER_HEIGHT = 56;

const courtFacilityInfo = {
  PARKING: { label: "주차장", icon: parkingIcon },
  SHOWER: { label: "샤워실", icon: showerIcon },
};

type DetailResult = { key: string; match?: MatchDetail; failed?: boolean };

export default function MatchDetailPage() {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const id = Number(matchId);
  const validId = Number.isSafeInteger(id) && id > 0;

  const [retryCount, setRetryCount] = useState(0);
  const [result, setResult] = useState<DetailResult>();
  const requestKey = `${id}:${retryCount}`;

  useEffect(() => {
    if (!validId) return;
    const controller = new AbortController();
    getMatchDetail(id, controller.signal).then(
      (match) => setResult({ key: requestKey, match }),
      () => {
        if (!controller.signal.aborted)
          setResult({ key: requestKey, failed: true });
      },
    );
    return () => controller.abort();
  }, [id, validId, requestKey]);

  const [image, setImage] = useState<HTMLDivElement | null>(null);
  const [headerFilled, setHeaderFilled] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [appliedMatchId, setAppliedMatchId] = useState<number>();
  const applied = appliedMatchId === id;
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!image) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeaderFilled(!entry.isIntersecting),
      { rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px` },
    );
    observer.observe(image);
    return () => observer.disconnect();
  }, [image]);

  const current = result?.key === requestKey ? result : undefined;
  const match = current?.match;
  const courtImage = useSignedImage(match?.court.thumbnailUrl);
  const hostImage = useSignedImage(match?.host.profileImageUrl);

  if (!validId) return <Navigate to="/" replace />;

  const goBack = () => {
    const historyIndex = (window.history.state as { idx?: number } | null)?.idx;
    if (historyIndex) void navigate(-1);
    else void navigate("/");
  };

  return (
    <PageLayout
      footer={
        match && (
          <div className="flex items-center gap-(--spacing-gap-large) border-0 border-t border-solid border-(--border-neutral-default) p-(--spacing-padding-large)">
            <div className="flex w-[113px] shrink-0 flex-col gap-(--spacing-gap-micro)">
              <p className="typography-heading-bold m-0 text-(color:--fg-neutral-default)">
                {formatPrice(match.participationFee)}
              </p>
              <p className="typography-caption-r-medium m-0 text-(color:--fg-neutral-tertiary)">
                호스트 수락 후 입금 안내
              </p>
            </div>
            <ActionButton
              size="M"
              className="flex-1"
              disabled={applied || !match.canApply}
              onClick={() => setApplyOpen(true)}
            >
              {applied
                ? "수락 대기중"
                : match.applicationBlockReason
                  ? applicationBlockLabels[match.applicationBlockReason]
                  : "신청하기"}
            </ActionButton>
          </div>
        )
      }
    >
      <div
        className={`sticky top-0 z-10 -mx-(--unit-16) transition-colors ${headerFilled ? "bg-(--bg-neutral-default)" : ""}`}
      >
        <Header variant="subpage" title="매치 상세" onBack={goBack} />
      </div>

      <div
        ref={setImage}
        className="-mx-(--unit-16) -mt-14 h-[230px] overflow-hidden bg-(--bg-neutral-weak)"
      >
        {courtImage.url && (
          <img
            src={courtImage.url}
            alt={match ? `${match.court.name} 사진` : ""}
            onError={courtImage.handleError}
            className="block size-full object-cover"
          />
        )}
      </div>

      {!current && (
        <p className="sr-only" aria-live="polite">
          매치 정보를 불러오는 중이에요
        </p>
      )}

      {current?.failed && (
        <div className="flex flex-col items-center gap-(--spacing-gap-medium) py-16">
          <p className="typography-body-regular m-0 text-(color:--fg-neutral-tertiary)">
            매치 정보를 불러오지 못했어요
          </p>
          <ActionButton
            variant="tertiary"
            size="S"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            다시 시도
          </ActionButton>
        </div>
      )}

      {match && (
        <div className="pt-5 pb-8">
          <Badge>
            {`${match.recruitmentOpen ? "모집중" : "모집 마감"} ${match.currentParticipantCount}/${match.capacity}`}
          </Badge>

          <section className="mt-3 flex flex-col gap-(--spacing-gap-small)">
            <h1 className="typography-heading-bold m-0 text-(color:--fg-neutral-default)">
              {formatMatchStart(match.startsAt)}
              <br />
              {match.court.name}
            </h1>
            <p className="typography-label-r-medium m-0 text-(color:--fg-neutral-secondary)">
              {match.court.address}
            </p>
            <div className="typography-label-r-medium flex items-center gap-(--spacing-gap-medium) text-(color:--fg-neutral-secondary)">
              <span>{formatMatchTypes(match.matchTypes)}</span>
              <Divider orientation="vertical" length={16} />
              <span>{formatNtrpRange(match.minNtrp, match.maxNtrp)}</span>
            </div>
            <p className="typography-label-r-medium m-0 flex items-center gap-(--spacing-gap-small) rounded-(--radius-small) bg-(--bg-neutral-weak) p-(--spacing-padding-small) text-(color:--fg-neutral-secondary)">
              <img src={clockIcon} alt="" width={16} height={16} />
              {formatDeadline(match.recruitmentDeadline)}
            </p>
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="typography-headline-bold m-0 text-(color:--fg-neutral-default)">
                참가자 정보
              </h2>
              <p className="typography-label-r-medium m-0 flex items-center gap-(--spacing-gap-micro) text-(color:--fg-neutral-subtle)">
                <img src={participantIcon} alt="" width={16} height={16} />
                <span
                  aria-label={`참가 인원 ${match.currentParticipantCount}명, 정원 ${match.capacity}명`}
                >
                  {match.currentParticipantCount}/{match.capacity}
                </span>
              </p>
            </div>
            {/* 임시: API에 참가자 목록이 없어 호스트만 표시합니다. */}
            <div className="-mx-(--unit-16) mt-3 flex gap-(--spacing-gap-small) overflow-x-auto px-(--unit-16)">
              <ProfileCard
                name={match.host.nickname}
                imageSrc={hostImage.url}
                badge="호스트"
                details={[
                  {
                    label: "구력",
                    value: formatExperience(match.host.experienceYears),
                  },
                ]}
              />
            </div>
          </section>

          {(match.court.facilities.length > 0 || match.court.facilityNotes) && (
            <section className="mt-8">
              <h2 className="typography-headline-bold m-0 text-(color:--fg-neutral-default)">
                코트 이용 안내
              </h2>
              {match.court.facilities.length > 0 && (
                <ul className="m-0 mt-3 flex list-none flex-col gap-(--spacing-gap-small) p-0">
                  {match.court.facilities.map(({ type, note }) => (
                    <li
                      key={type}
                      className="grid grid-cols-[24px_minmax(0,1fr)] items-start gap-(--spacing-gap-medium)"
                    >
                      <img
                        className="block"
                        src={courtFacilityInfo[type].icon}
                        alt=""
                        width={24}
                        height={24}
                      />
                      <div className="min-w-0">
                        <p className="typography-label-l-medium m-0 text-(color:--fg-neutral-default)">
                          {courtFacilityInfo[type].label}
                        </p>
                        {note && (
                          <p className="typography-label-r-regular m-0 mt-(--spacing-gap-micro) break-words whitespace-pre-line text-(color:--fg-neutral-secondary)">
                            {note}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {match.court.facilityNotes && (
                <p className="typography-label-r-regular m-0 mt-2 break-words whitespace-pre-line text-(color:--fg-neutral-secondary)">
                  {match.court.facilityNotes}
                </p>
              )}
            </section>
          )}

          <section className="mt-8">
            <h2 className="typography-headline-bold m-0 text-(color:--fg-neutral-default)">
              취소, 환불 규정
            </h2>
            <p className="typography-body-regular m-0 mt-3 text-(color:--fg-neutral-secondary)">
              {REFUND_POLICY.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </section>
        </div>
      )}
      {match && applyOpen && (
        <ApplySheet
          match={match}
          onClose={() => setApplyOpen(false)}
          onApplied={() => {
            setAppliedMatchId(match.matchId);
            setToast(APPLIED_TOAST);
          }}
        />
      )}
      <Toast
        message={toast}
        onDismiss={() => setToast(null)}
        className="pointer-events-none fixed inset-x-0 bottom-[calc(93px+env(safe-area-inset-bottom,0px))] z-20 mx-auto flex max-w-[480px] justify-center px-(--unit-16)"
      />
    </PageLayout>
  );
}
