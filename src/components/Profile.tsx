import { useState } from "react";

const sizeStyles = {
  S: "size-10",
  M: "size-15",
  L: "size-24",
};

type ProfileProps = {
  src?: string | null;
  size?: keyof typeof sizeStyles;
  alt?: string;
  className?: string;
};

export function Profile({
  src,
  size = "L",
  alt = "",
  className,
}: ProfileProps) {
  const [failedSource, setFailedSource] = useState<string>();
  const hasImage = Boolean(src && src !== failedSource);

  return (
    <span
      className={[
        "relative inline-block box-border shrink-0 overflow-hidden rounded-(--radius-full) border border-solid border-(--border-neutral-default) bg-(--bg-neutral-weak) align-middle",
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role={!hasImage && alt ? "img" : undefined}
      aria-label={!hasImage && alt ? alt : undefined}
    >
      {hasImage && (
        <img
          key={src}
          src={src ?? undefined}
          alt={alt}
          className="pointer-events-none absolute inset-0 size-full object-cover"
          onError={(event) =>
            setFailedSource(
              event.currentTarget.getAttribute("src") ?? undefined,
            )
          }
        />
      )}
    </span>
  );
}
