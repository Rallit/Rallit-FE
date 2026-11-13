import type { PropsWithChildren, ReactNode } from "react";

type PageLayoutProps = PropsWithChildren<{ footer?: ReactNode }>;

export function PageLayout({ children, footer }: PageLayoutProps) {
  const hasFooter = Boolean(footer);
  const classes = [
    "page-layout box-border mx-auto min-h-dvh w-full max-w-[480px] bg-(--bg-neutral-default)",
    "[@media(width>480px)]:h-dvh [@media(width>480px)]:overflow-y-auto [@media(width>480px)]:overscroll-y-contain",
    hasFooter ? "flex flex-col" : "px-(--unit-16)",
  ].join(" ");

  return (
    <main className={classes} tabIndex={0}>
      {hasFooter ? (
        <>
          <div className="page-layout__content flex-[1_0_auto] px-(--unit-16)">
            {children}
          </div>
          <div className="page-layout__footer sticky bottom-0 z-1 flex-none bg-(--bg-neutral-default) pb-[env(safe-area-inset-bottom,0px)]">
            {footer}
          </div>
        </>
      ) : (
        children
      )}
    </main>
  );
}
