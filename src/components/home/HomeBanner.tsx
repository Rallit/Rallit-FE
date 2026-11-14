import forwardIcon from "../../../assets/icons/forward.svg";

type HomeBannerProps = {
  onClick?: () => void;
};

export function HomeBanner({ onClick }: HomeBannerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative box-border flex w-full cursor-pointer appearance-none items-end overflow-hidden rounded-(--radius-large) border-0 bg-(--bg-neutral-default) p-(--spacing-padding-large) text-left"
    >
      <span
        aria-hidden="true"
        className="absolute top-0 right-0 h-full w-28 bg-(--bg-neutral-weak)"
      />
      <span className="relative flex flex-col gap-(--spacing-gap-micro)">
        <span className="typography-headline-bold flex items-center gap-(--spacing-gap-micro) text-(color:--fg-neutral-default)">
          매치 찾으러 가기
          <img src={forwardIcon} alt="" className="block shrink-0" />
        </span>
        <span className="typography-label-r-regular text-(color:--fg-neutral-tertiary)">
          구체적인 조건을 주면 알림 보내드려요
        </span>
      </span>
    </button>
  );
}
