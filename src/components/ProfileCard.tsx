import { Badge } from "./Badge";
import { Profile } from "./Profile";

type ProfileCardProps = {
  name: string;
  imageSrc?: string | null;
  badge?: string;
  details: readonly { label: string; value: string }[];
};

export function ProfileCard({
  name,
  imageSrc,
  badge,
  details,
}: ProfileCardProps) {
  return (
    <article className="box-border flex h-[174px] w-[152px] shrink-0 flex-col gap-(--spacing-gap-small) rounded-(--radius-medium) border border-solid border-(--border-neutral-default) bg-(--bg-neutral-default) p-(--spacing-padding-large)">
      <div className="flex items-start justify-between">
        <Profile src={imageSrc} size="S" />
        {badge && <Badge variant="blue">{badge}</Badge>}
      </div>
      <p className="typography-label-r-medium m-0 line-clamp-2 break-keep text-(color:--fg-neutral-default)">
        {name}
      </p>
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
    </article>
  );
}
