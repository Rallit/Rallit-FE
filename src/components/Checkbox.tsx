import type { ComponentProps } from "react";
import checkIcon from "../../assets/icons/checkbox-check.svg";
import selectedCheckIcon from "../../assets/icons/checkbox-check-inverse.svg";

type CheckboxProps = Omit<ComponentProps<"input">, "type" | "children">;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <span
      className={[
        "relative inline-grid size-(--unit-32) shrink-0 place-items-center align-middle",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        {...props}
        type="checkbox"
        className="peer absolute inset-0 z-1 m-0 size-full cursor-pointer opacity-0 disabled:cursor-default"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute grid size-(--unit-24) place-items-center rounded-(--radius-small) bg-(--bg-neutral-default) inset-ring inset-ring-(--border-neutral-default) peer-checked:peer-enabled:bg-(--bg-primary-strong) peer-checked:inset-ring-0 peer-disabled:bg-(--bg-state-disabled) peer-checked:peer-disabled:bg-[linear-gradient(var(--bg-primary-inverse),var(--bg-primary-inverse))] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--fg-neutral-default)"
      />
      <img
        src={checkIcon}
        alt=""
        className="pointer-events-none relative block peer-checked:hidden"
      />
      <img
        src={selectedCheckIcon}
        alt=""
        className="pointer-events-none relative hidden peer-checked:block"
      />
    </span>
  );
}
