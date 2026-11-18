import type { ComponentProps } from "react";
import { Badge } from "./Badge";
import { Profile } from "./Profile";

type ApplicantListItemProps = {
  name: string;
  description: string;
  imageSrc?: string | null;
  badge?: {
    label: string;
    variant?: ComponentProps<typeof Badge>["variant"];
  };
  className?: string;
};

export function ApplicantListItem({
  name,
  description,
  imageSrc,
  badge,
  className,
}: ApplicantListItemProps) {
  return (
    <div
      className={[
        "flex w-full items-center justify-between gap-(--spacing-gap-small)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex min-w-0 flex-1 items-center gap-(--spacing-gap-medium)">
        <Profile src={imageSrc} size="S" />
        <div className="flex min-w-0 flex-col gap-(--spacing-gap-micro)">
          <p className="typography-body-medium m-0 truncate text-(color:--fg-neutral-default)">
            {name}
          </p>
          <p className="typography-caption-r-medium m-0 truncate text-(color:--fg-neutral-tertiary)">
            {description}
          </p>
        </div>
      </div>
      {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
    </div>
  );
}
