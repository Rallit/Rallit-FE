import type { ComponentProps } from "react";
import { Profile } from "./Profile";

type NotificationProps = Omit<
  ComponentProps<"button">,
  "children" | "type" | "title"
> & {
  title: string;
  description: string;
  time: string;
  imageSrc?: string | null;
  profile?: boolean;
  isNew?: boolean;
};

export function Notification({
  title,
  description,
  time,
  imageSrc,
  profile = true,
  isNew = false,
  className,
  ...props
}: NotificationProps) {
  return (
    <button
      {...props}
      type="button"
      className={[
        "box-border flex h-20 w-full cursor-pointer appearance-none items-start gap-(--spacing-gap-large) border-0 p-(--spacing-padding-large) text-start",
        "bg-[linear-gradient(var(--notification-overlay),var(--notification-overlay))] [--notification-overlay:transparent] active:[--notification-overlay:var(--bg-state-pressed)]",
        isNew ? "bg-(--bg-neutral-weak)" : "bg-(--bg-neutral-default)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="flex min-w-0 flex-1 items-center gap-(--spacing-gap-medium)">
        {profile && <Profile src={imageSrc} size="S" />}
        <span className="flex min-w-0 flex-1 flex-col gap-(--spacing-gap-micro)">
          <span className="typography-body-medium truncate text-(color:--fg-neutral-default)">
            {isNew && <span className="sr-only">새 알림 </span>}
            {title}
          </span>
          <span className="typography-label-r-regular truncate text-(color:--fg-neutral-secondary)">
            {description}
          </span>
        </span>
      </span>
      <span className="typography-label-r-regular shrink-0 whitespace-nowrap text-(color:--fg-neutral-subtle)">
        {time}
      </span>
    </button>
  );
}
