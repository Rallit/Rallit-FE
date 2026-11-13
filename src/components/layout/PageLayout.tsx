import type { PropsWithChildren, ReactNode } from "react";

type PageLayoutProps = PropsWithChildren<{
  header?: ReactNode;
  footer?: ReactNode;
}>;

export function PageLayout({ children, header, footer }: PageLayoutProps) {
  const hasFooter = Boolean(footer);
  const hasSlots = Boolean(header) || hasFooter;
  const classes = [
    "page-layout box-border mx-auto min-h-dvh w-full max-w-[480px] bg-(--bg-neutral-default) pt-[env(safe-area-inset-top,0px)]",
    "[@media(width>480px)]:h-dvh [@media(width>480px)]:overflow-y-auto [@media(width>480px)]:overscroll-y-contain",
    hasSlots
      ? "flex flex-col pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
      : "pl-[calc(var(--unit-16)+env(safe-area-inset-left,0px))] pr-[calc(var(--unit-16)+env(safe-area-inset-right,0px))]",
    !hasFooter && "pb-[env(safe-area-inset-bottom,0px)]",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={classes} tabIndex={0}>
      {hasSlots ? (
        <>
          {header && <div className="shrink-0">{header}</div>}
          <div className="page-layout__content flex-[1_0_auto] px-(--unit-16)">
            {children}
          </div>
          {hasFooter && (
            <div className="page-layout__footer sticky bottom-0 z-1 flex-none bg-(--bg-neutral-default) pb-[env(safe-area-inset-bottom,0px)]">
              {footer}
            </div>
          )}
        </>
      ) : (
        children
      )}
    </main>
  );
}
