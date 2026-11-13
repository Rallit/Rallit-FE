import type { ComponentProps } from "react";
import googleIcon from "../../../assets/icons/google.svg";
import kakaoIcon from "../../../assets/icons/kakao.svg";
import type { SocialProvider } from "@/platform/authNavigation.web";

const providers: Record<
  SocialProvider,
  { label: string; icon: string; background: string }
> = {
  kakao: {
    label: "카카오로 시작하기",
    icon: kakaoIcon,
    background: "bg-[#ffe812]",
  },
  google: {
    label: "Google로 계속하기",
    icon: googleIcon,
    background: "bg-[#f6f7f8]",
  },
};

const baseStyles = [
  "typography-label-l-medium box-border flex h-12 w-full cursor-pointer appearance-none items-center justify-center",
  "gap-(--spacing-gap-small) rounded-(--radius-medium) border-0 px-[10px] py-(--spacing-padding-medium) text-(color:--fg-neutral-default)",
  "bg-[linear-gradient(var(--social-button-overlay),var(--social-button-overlay))] [--social-button-overlay:transparent]",
  "enabled:hover:[--social-button-overlay:var(--bg-state-hover)] enabled:active:[--social-button-overlay:var(--bg-state-pressed)]",
  "disabled:cursor-default",
].join(" ");

type SocialLoginButtonProps = Omit<
  ComponentProps<"button">,
  "children" | "type"
> & {
  provider: SocialProvider;
  loading?: boolean;
};

export function SocialLoginButton({
  provider,
  loading = false,
  className,
  ...props
}: SocialLoginButtonProps) {
  const { label, icon, background } = providers[provider];

  return (
    <button
      {...props}
      type="button"
      aria-busy={loading || undefined}
      className={[baseStyles, background, className].filter(Boolean).join(" ")}
    >
      <img src={icon} alt="" className="block size-5 shrink-0" />
      <span>{loading ? "처리 중…" : label}</span>
    </button>
  );
}
