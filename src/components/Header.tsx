import type { MouseEventHandler } from "react";
import logo from "../../assets/images/rallit-logo.svg";
import backIcon from "../../assets/icons/back.svg";
import notificationIcon from "../../assets/icons/notification.svg";

type HeaderProps =
  | { variant: "logo"; onNotifications: MouseEventHandler<HTMLButtonElement> }
  | {
      variant: "subpage";
      title?: string;
      onBack: MouseEventHandler<HTMLButtonElement>;
    };

const iconButton =
  "grid size-11 shrink-0 cursor-pointer appearance-none place-items-center border-0 bg-transparent p-0";

export function Header(props: HeaderProps) {
  if (props.variant === "logo") {
    return (
      <header className="box-border flex h-14 w-full items-center justify-between pr-(--spacing-padding-large) pl-(--spacing-padding-medium)">
        <div className="relative h-full w-[76px] shrink-0">
          <img
            src={logo}
            alt="Rallit"
            className="absolute top-[13.55px] left-[0.89px] block"
          />
        </div>
        <button
          type="button"
          aria-label="알림"
          onClick={props.onNotifications}
          className={`-mr-2.5 ${iconButton}`}
        >
          <img src={notificationIcon} alt="" className="block" />
        </button>
      </header>
    );
  }

  return (
    <header className="box-border grid h-14 w-full grid-cols-[24px_minmax(0,1fr)_24px] items-center px-(--spacing-padding-large)">
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={props.onBack}
        className={`-ml-2.5 ${iconButton}`}
      >
        <img src={backIcon} alt="" className="block" />
      </button>
      {props.title && (
        <h1 className="typography-headline-bold m-0 truncate px-(--spacing-gap-medium) text-center text-(color:--fg-neutral-secondary)">
          {props.title}
        </h1>
      )}
    </header>
  );
}
