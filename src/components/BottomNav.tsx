import homeActiveIcon from "../../assets/icons/home-active.svg";
import homeIcon from "../../assets/icons/home.svg";
import myActiveIcon from "../../assets/icons/my-active.svg";
import myIcon from "../../assets/icons/my.svg";
import tennisActiveIcon from "../../assets/icons/tennis-active.svg";
import tennisIcon from "../../assets/icons/tennis.svg";
import { BottomNavItem } from "./BottomNavItem";

const items = [
  { href: "/", label: "홈", icon: homeIcon, activeIcon: homeActiveIcon },
  {
    href: "/schedule",
    label: "매치 현황",
    icon: tennisIcon,
    activeIcon: tennisActiveIcon,
  },
  { href: "/my", label: "마이", icon: myIcon, activeIcon: myActiveIcon },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="하단 메뉴"
      className="box-border flex h-[69px] w-full justify-between border-t border-(--border-neutral-weak) bg-(--bg-neutral-default) px-(--spacing-padding-extra-large)"
    >
      {items.map(({ href, label, icon, activeIcon }) => (
        <BottomNavItem
          key={href}
          href={href}
          label={label}
          icon={icon}
          activeIcon={activeIcon}
        />
      ))}
    </nav>
  );
}
