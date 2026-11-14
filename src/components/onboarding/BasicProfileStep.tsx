import { Profile } from "@/components/Profile";
import { SelectionChip } from "@/components/SelectionChip";
import { TextInputField } from "@/components/TextInputField";

const genders = [
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
] as const;

const ageGroups = [
  { value: "TEENS", label: "10대" },
  { value: "TWENTIES", label: "20대" },
  { value: "THIRTIES", label: "30대" },
  { value: "FORTIES", label: "40대" },
  { value: "FIFTIES", label: "50대" },
  { value: "SIXTIES_OR_OLDER", label: "60대 이상" },
] as const;

const nicknameMaxLength = 12;

export type BasicProfileDraft = {
  nickname: string;
  gender: (typeof genders)[number]["value"] | null;
  ageGroup: (typeof ageGroups)[number]["value"] | null;
};

type BasicProfileStepProps = {
  value: BasicProfileDraft;
  onChange: (value: BasicProfileDraft) => void;
  nicknameError?: string;
  onNicknameBlur: () => void;
  onCheckNickname?: () => void;
  checkingNickname: boolean;
  nicknameConfirmed: boolean;
};

export function BasicProfileStep({
  value,
  onChange,
  nicknameError,
  onNicknameBlur,
  onCheckNickname,
  checkingNickname,
  nicknameConfirmed,
}: BasicProfileStepProps) {
  const nicknameAccessory = nicknameConfirmed
    ? { trailingIcon: "check" as const }
    : onCheckNickname
      ? {
          trailingAction: {
            label: checkingNickname ? "확인 중" : "중복",
            onClick: onCheckNickname,
            disabled: checkingNickname,
          },
        }
      : {};

  return (
    <div className="mt-(--spacing-gap-extra-large)">
      <div className="flex justify-center">
        <Profile alt="기본 프로필 이미지" />
      </div>

      <div className="mt-(--spacing-padding-extra-large) grid gap-(--spacing-gap-large)">
        <div className="grid gap-(--spacing-gap-medium)">
          <div className="flex items-center justify-between">
            <label
              htmlFor="onboarding-nickname"
              className="typography-label-r-medium text-(color:--fg-neutral-secondary)"
            >
              닉네임
            </label>
            <span className="typography-caption-r-medium text-(color:--fg-neutral-subtle)">
              {value.nickname.length}/{nicknameMaxLength}
            </span>
          </div>
          <TextInputField
            {...nicknameAccessory}
            id="onboarding-nickname"
            value={value.nickname}
            onChange={(event) =>
              onChange({ ...value, nickname: event.currentTarget.value })
            }
            onBlur={onNicknameBlur}
            maxLength={nicknameMaxLength}
            placeholder="닉네임을 입력해 주세요"
            caption={
              nicknameConfirmed
                ? undefined
                : "서비스 내에서 프로필에 표시됩니다."
            }
            error={nicknameError}
            errorAppearance="outline"
          />
        </div>

        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="typography-label-r-medium p-0 text-(color:--fg-neutral-secondary)">
            성별
          </legend>
          <div className="mt-(--spacing-gap-medium) flex flex-wrap gap-(--spacing-gap-small)">
            {genders.map(({ label, value: gender }) => (
              <SelectionChip
                key={gender}
                label={label}
                className="h-[38px]!"
                selected={value.gender === gender}
                onClick={() =>
                  onChange({
                    ...value,
                    gender: value.gender === gender ? null : gender,
                  })
                }
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="typography-label-r-medium p-0 text-(color:--fg-neutral-secondary)">
            연령대
          </legend>
          <div className="mt-(--spacing-gap-medium) flex flex-wrap gap-(--spacing-gap-small)">
            {ageGroups.map(({ label, value: ageGroup }) => (
              <SelectionChip
                key={ageGroup}
                label={label}
                className="h-[38px]!"
                selected={value.ageGroup === ageGroup}
                onClick={() =>
                  onChange({
                    ...value,
                    ageGroup: value.ageGroup === ageGroup ? null : ageGroup,
                  })
                }
              />
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
