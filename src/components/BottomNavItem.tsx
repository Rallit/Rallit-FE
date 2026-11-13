type BottomNavItemProps = {
  label: string;
  href: string;
  icon: string;
  active: boolean;
};

export function BottomNavItem({
  label,
  href,
  icon,
  active,
}: BottomNavItemProps) {
  const color = active
    ? "text-(color:--fg-neutral-default)"
    : "text-(color:--fg-neutral-subtle)";

  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={`typography-caption-r-medium flex w-16 shrink-0 flex-col items-center justify-center gap-(--spacing-gap-micro) py-(--spacing-padding-medium) text-center no-underline ${color}`}
    >
      <span className="grid size-6 place-items-center">
        <img src={icon} alt="" className="block" />
      </span>
      {label}
    </a>
  );
}
