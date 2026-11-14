import type { MouseEventHandler } from "react";
import logo from "../../assets/images/rallit-logo.svg";
import backIcon from "../../assets/icons/back.svg";
import notificationIcon from "../../assets/icons/notification.svg";
import settingsIcon from "../../assets/icons/settings.svg";
import sheetCloseIcon from "../../assets/icons/sheet-close.svg";
import { IconButton } from "./IconButton";

type HeaderProps =
  | { variant: "logo"; onNotifications: MouseEventHandler<HTMLButtonElement> }
  | {
      variant: "main";
      title: string;
      onSettings?: MouseEventHandler<HTMLButtonElement>;
    }
  | {
      variant: "subpage";
      title?: string;
      onBack: MouseEventHandler<HTMLButtonElement>;
    }
  | {
      variant: "sheet";
      title: string;
      titleId?: string;
      onClose: MouseEventHandler<HTMLButtonElement>;
    };

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
        <IconButton
          aria-label="알림"
          icon={notificationIcon}
          onClick={props.onNotifications}
          className="-mr-2.5"
        />
      </header>
    );
  }

  if (props.variant === "main" || props.variant === "sheet") {
    const isSheet = props.variant === "sheet";
    const action = isSheet ? props.onClose : props.onSettings;
    const titleStyle = isSheet
      ? "typography-heading-bold"
      : "typography-title-bold font-bold!";
    const height = isSheet ? "h-16" : "h-14";
    const Title = isSheet ? "h2" : "h1";

    return (
      <header
        className={`box-border flex w-full items-center justify-between gap-(--spacing-gap-micro) px-(--spacing-padding-large) ${height}`}
      >
        <Title
          id={props.variant === "sheet" ? props.titleId : undefined}
          className={`m-0 min-w-0 truncate text-(color:--fg-neutral-default) ${titleStyle}`}
        >
          {props.title}
        </Title>
        {action && (
          <IconButton
            aria-label={isSheet ? "닫기" : "설정"}
            icon={isSheet ? sheetCloseIcon : settingsIcon}
            iconClassName={isSheet ? undefined : "translate-y-[0.25px]"}
            onClick={action}
            className="-mr-2.5"
          />
        )}
      </header>
    );
  }

  return (
    <header className="box-border grid h-14 w-full grid-cols-[24px_minmax(0,1fr)_24px] items-center px-(--spacing-padding-large)">
      <IconButton
        aria-label="뒤로 가기"
        icon={backIcon}
        onClick={props.onBack}
        className="-ml-2.5"
      />
      {props.title && (
        <h1 className="typography-headline-bold m-0 truncate px-(--spacing-gap-medium) text-center text-(color:--fg-neutral-secondary)">
          {props.title}
        </h1>
      )}
    </header>
  );
}
