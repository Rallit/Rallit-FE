import { Outlet, useMatch } from "react-router";
import { BottomNav } from "@/components/BottomNav";
import { FAB } from "@/components/FAB";
import { Header } from "@/components/Header";
import { PageLayout } from "./PageLayout";

export function MainTabsLayout() {
  const isHome = Boolean(useMatch({ path: "/", end: true }));
  const isSchedule = Boolean(useMatch({ path: "/schedule", end: true }));

  return (
    <PageLayout
      background="weak"
      header={
        isHome ? (
          <Header variant="logo" onNotifications={() => {}} />
        ) : isSchedule ? (
          <Header variant="main" title="매치 현황" />
        ) : undefined
      }
      footer={
        <div className="relative">
          {isHome && (
            <FAB
              label="매치 열기"
              collapsed
              className="absolute right-4 bottom-[calc(100%+16px)]"
            />
          )}
          <BottomNav />
        </div>
      }
    >
      <Outlet />
    </PageLayout>
  );
}

export function MainTabPlaceholder({ title }: { title: string }) {
  return (
    <h1 className="typography-heading-bold m-0 pt-4 text-(color:--fg-neutral-default)">
      {title}
    </h1>
  );
}
