import { useId } from "react";
import type { ComponentProps } from "react";
import checkIcon from "../../assets/icons/check-round.svg";
import { ActionButton } from "./ActionButton";

type TrailingAction = Pick<
  ComponentProps<typeof ActionButton>,
  "onClick" | "disabled"
> & { label: string };

type TextInputFieldProps = Omit<
  ComponentProps<"input">,
  "children" | "type"
> & {
  type?: "text" | "email" | "password" | "search" | "tel" | "url";
  caption?: string;
  error?: string;
} & (
    | { trailingAction: TrailingAction; trailingIcon?: never }
    | { trailingAction?: never; trailingIcon?: "check" }
  );

const normalStyle =
  "bg-(--bg-neutral-default) inset-ring inset-ring-(--border-neutral-weak) has-[input:placeholder-shown:not(:focus)]:inset-ring-(--border-neutral-default) has-[input:focus]:inset-ring-(--border-brand-focus)";
const errorStyle =
  "bg-(--bg-neutral-default) inset-ring inset-ring-(--border-system-error) [&:not(:has(input:focus,input:placeholder-shown))]:bg-(--bg-system-error) [&:not(:has(input:focus,input:placeholder-shown))]:inset-ring-0";

export function TextInputField({
  type = "text",
  caption,
  error,
  disabled,
  trailingAction,
  trailingIcon,
  className,
  placeholder,
  "aria-describedby": describedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: TextInputFieldProps) {
  const id = useId();
  const invalid =
    !disabled &&
    (Boolean(error) ||
      ariaInvalid === true ||
      ariaInvalid === "true" ||
      ariaInvalid === "grammar" ||
      ariaInvalid === "spelling");
  const errorMessage = invalid ? error : undefined;
  const message = errorMessage || caption;
  const showCheck = !disabled && trailingIcon === "check";
  const descriptionIds = [
    describedBy,
    message && `${id}-message`,
    showCheck && `${id}-check`,
  ]
    .filter(Boolean)
    .join(" ");
  let fieldStyle = normalStyle;
  if (disabled) {
    fieldStyle =
      "bg-(--bg-neutral-weak) inset-ring inset-ring-(--border-neutral-weak)";
  } else if (invalid) {
    fieldStyle = [
      errorStyle,
      trailingAction &&
        "has-[input:placeholder-shown:not(:focus)]:inset-ring-(--border-neutral-default)",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return (
    <div
      className={["grid w-full min-w-0 gap-(--spacing-gap-small)", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={`box-border flex h-[52px] min-w-0 items-center gap-(--spacing-gap-small) rounded-(--radius-medium) px-(--spacing-padding-medium) ${fieldStyle}`}
      >
        <input
          {...props}
          type={type}
          placeholder={placeholder || " "}
          disabled={disabled}
          aria-describedby={descriptionIds || undefined}
          aria-invalid={invalid ? (error ? true : ariaInvalid) : undefined}
          className={`typography-body-regular box-border w-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-(color:--fg-neutral-default) outline-none placeholder:text-(color:--fg-neutral-subtle) disabled:text-(color:--fg-neutral-subtle) disabled:opacity-100 ${invalid ? "focus:text-(color:--fg-system-error)" : ""}`}
        />
        {!disabled && trailingAction && (
          <ActionButton
            variant="tertiary"
            size="S"
            className="shrink-0"
            onClick={trailingAction.onClick}
            disabled={trailingAction.disabled}
          >
            {trailingAction.label}
          </ActionButton>
        )}
        {showCheck && (
          <img
            id={`${id}-check`}
            src={checkIcon}
            alt="확인 완료"
            className="block shrink-0"
          />
        )}
      </div>
      {message && (
        <p
          id={`${id}-message`}
          className={`typography-caption-r-regular m-0 ${errorMessage ? "text-(color:--fg-system-error)" : "text-(color:--fg-neutral-tertiary)"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
