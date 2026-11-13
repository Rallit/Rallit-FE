import type { ComponentProps } from "react";
import addIcon from "../../assets/icons/fab-add.svg";

type FABProps = Omit<ComponentProps<"button">, "children" | "aria-label"> & {
  label: string;
  collapsed?: boolean;
};

export function FAB({
  label,
  collapsed = false,
  type = "button",
  className,
  ...props
}: FABProps) {
  return (
    <button
      {...props}
      type={type}
      aria-label={collapsed ? label : undefined}
      className={[
        "typography-label-l-medium box-border inline-flex h-12 max-w-full shrink-0 cursor-pointer appearance-none items-center justify-center gap-(--spacing-gap-micro) rounded-full border-0 bg-(--bg-neutral-default) px-(--spacing-padding-medium) py-0 text-(color:--fg-accent-default) shadow-[0_2.58px_19.351px_var(--gray-alpha-100)] disabled:cursor-default",
        collapsed ? "w-12" : "w-fit",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {!collapsed && <span className="min-w-0 truncate">{label}</span>}
      <img src={addIcon} alt="" className="block shrink-0" />
    </button>
  );
}
