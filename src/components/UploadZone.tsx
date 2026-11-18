import type { ComponentProps } from "react";
import imageIcon from "../../assets/icons/image.svg";

type UploadZoneProps = Omit<ComponentProps<"button">, "children" | "type"> & {
  caption: string;
};

export function UploadZone({ caption, className, ...props }: UploadZoneProps) {
  return (
    <button
      {...props}
      type="button"
      className={[
        "box-border flex h-[98px] w-full cursor-pointer appearance-none flex-col items-center justify-center gap-(--spacing-gap-micro) rounded-(--radius-medium) border-0 bg-(--bg-neutral-weak) p-(--spacing-padding-medium) disabled:cursor-default",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img src={imageIcon} alt="" className="block size-5 shrink-0" />
      <span className="typography-caption-r-medium text-(color:--fg-neutral-tertiary)">
        {caption}
      </span>
    </button>
  );
}
