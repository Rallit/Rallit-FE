import homeActiveIcon from "../../assets/icons/home-active.svg";
import homeIcon from "../../assets/icons/home.svg";
import myActiveIcon from "../../assets/icons/my-active.svg";
import myIcon from "../../assets/icons/my.svg";
import tennisActiveIcon from "../../assets/icons/tennis-active.svg";
import tennisIcon from "../../assets/icons/tennis.svg";
import { BottomNavItem } from "./BottomNavItem";

const items = [
  { id: "home", label: "홈", icon: homeIcon, activeIcon: homeActiveIcon },
  {
    id: "schedule",
    label: "매치 현황",
    icon: tennisIcon,
    activeIcon: tennisActiveIcon,
  },
  { id: "my", label: "마이", icon: myIcon, activeIcon: myActiveIcon },
] as const;

type BottomNavTab = (typeof items)[number]["id"];

type BottomNavProps = {
  activeTab: BottomNavTab;
  hrefs: Record<BottomNavTab, string>;
};

export function BottomNav({ activeTab, hrefs }: BottomNavProps) {
  return (
    <nav
      aria-label="하단 메뉴"
      className="box-border flex h-[69px] w-full justify-between border-t border-(--border-neutral-weak) bg-(--bg-neutral-default) px-(--spacing-padding-extra-large)"
    >
      {items.map(({ id, label, icon, activeIcon }) => (
        <BottomNavItem
          key={id}
          href={hrefs[id]}
          label={label}
          icon={id === activeTab ? activeIcon : icon}
          active={id === activeTab}
        />
      ))}
    </nav>
  );
}
