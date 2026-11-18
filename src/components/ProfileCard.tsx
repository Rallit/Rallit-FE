import { ActionButton } from "./ActionButton";
import { Badge } from "./Badge";
import { Profile } from "./Profile";

type ProfileCardProps = {
  name: string;
  imageSrc?: string | null;
  badge?: string;
  details: readonly { label: string; value: string }[];
  actions?: {
    onReject: () => void;
    onAccept: () => void;
    disabled?: boolean;
  };
};

export function ProfileCard({
  name,
  imageSrc,
  badge,
  details,
  actions,
}: ProfileCardProps) {
  const profile = (
    <>
      <div className="flex items-start justify-between">
        <Profile src={imageSrc} size="S" />
        {badge && <Badge variant="blue">{badge}</Badge>}
      </div>
      <p className="typography-label-r-medium m-0 line-clamp-2 break-keep text-(color:--fg-neutral-default)">
        {name}
      </p>
    </>
  );

  const detailList = (
    <dl className="m-0 grid">
      {details.map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between">
          <dt className="typography-caption-r-medium text-(color:--fg-neutral-tertiary)">
            {label}
          </dt>
          <dd className="typography-label-r-medium m-0 text-(color:--fg-neutral-secondary)">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );

  return (
    <article
      className={`box-border flex w-[152px] shrink-0 flex-col rounded-(--radius-medium) border border-solid border-(--border-neutral-default) bg-(--bg-neutral-default) p-(--spacing-padding-large) ${actions ? "h-[218px] justify-between" : "h-[174px] gap-(--spacing-gap-small)"}`}
    >
      {actions ? (
        <>
          <div className="flex flex-col gap-(--spacing-gap-small)">
            {profile}
          </div>
          <div className="flex flex-col gap-(--spacing-gap-small)">
            {detailList}
            <div className="flex gap-(--spacing-gap-micro)">
              <ActionButton
                variant="tertiary"
                size="S"
                disabled={actions.disabled}
                onClick={actions.onReject}
                aria-label={`${name} 신청 거절`}
                className="flex-1"
              >
                거절
              </ActionButton>
              <ActionButton
                size="S"
                disabled={actions.disabled}
                onClick={actions.onAccept}
                aria-label={`${name} 신청 수락`}
                className="flex-1"
              >
                수락
              </ActionButton>
            </div>
          </div>
        </>
      ) : (
        <>
          {profile}
          {detailList}
        </>
      )}
    </article>
  );
}
