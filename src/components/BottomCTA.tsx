import {
  ActionButton,
  type ActionButtonProps,
} from "@/components/ActionButton";

type Action = Omit<ActionButtonProps, "variant" | "size" | "fullWidth">;

type BottomCTAProps = { primaryAction: Action } & (
  | { secondaryAction?: never; layout?: never }
  | {
      secondaryAction: Action & { variant: "secondary" | "tertiary" };
      layout: "vertical" | "horizontal";
    }
);

export function BottomCTA({
  primaryAction,
  secondaryAction,
  layout,
}: BottomCTAProps) {
  const primary = (
    <ActionButton {...primaryAction} variant="primary" size="M" fullWidth />
  );
  const secondary = secondaryAction && (
    <ActionButton {...secondaryAction} size="M" fullWidth />
  );

  const columns = layout === "horizontal" ? "grid-cols-2" : "grid-cols-1";

  return (
    <div
      className={`bottom-cta box-border grid w-full gap-(--spacing-gap-small) px-(--spacing-padding-large) ${columns}`}
      data-layout={layout}
    >
      {layout === "horizontal" ? secondary : primary}
      {layout === "horizontal" ? primary : secondary}
    </div>
  );
}
