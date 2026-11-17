import type { ComponentProps } from "react";
import closeIcon from "../../assets/icons/close.svg";
import searchIcon from "../../assets/icons/search.svg";
import { IconButton } from "./IconButton";

type SearchFieldProps = Omit<
  ComponentProps<"input">,
  "type" | "value" | "onChange"
> & {
  value: string;
  onValueChange: (value: string) => void;
  clearLabel?: string;
};

export function SearchField({
  value,
  onValueChange,
  clearLabel = "검색어 지우기",
  className,
  ...props
}: SearchFieldProps) {
  return (
    <div
      className={[
        "box-border flex h-[52px] w-full items-center gap-(--spacing-gap-small) rounded-(--radius-medium) bg-(--bg-neutral-default) px-(--spacing-padding-medium) inset-ring has-[input:focus]:inset-ring-(--border-brand-focus)",
        value
          ? "inset-ring-(--border-neutral-weak)"
          : "inset-ring-(--border-neutral-default)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <img src={searchIcon} alt="" className="block size-6 shrink-0" />
      <input
        {...props}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        className="typography-body-regular min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-(color:--fg-neutral-default) outline-none placeholder:text-(color:--fg-neutral-subtle) [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <IconButton
          size="small"
          icon={closeIcon}
          iconColor="var(--fg-neutral-tertiary)"
          aria-label={clearLabel}
          onClick={() => onValueChange("")}
          className="-m-3"
        />
      )}
    </div>
  );
}
