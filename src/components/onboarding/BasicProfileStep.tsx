import { useRef, useState, type ChangeEvent } from "react";
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
const profilePhotoMaxBytes = 5 * 1024 * 1024;

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
  photoUrl: string | null;
  uploadingPhoto: boolean;
  photoUploadError: string;
  onSelectPhoto: (file: File) => void;
};

export function BasicProfileStep({
  value,
  onChange,
  nicknameError,
  onNicknameBlur,
  onCheckNickname,
  checkingNickname,
  nicknameConfirmed,
  photoUrl,
  uploadingPhoto,
  photoUploadError,
  onSelectPhoto,
}: BasicProfileStepProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState("");

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || uploadingPhoto) return;

    const jpeg = /\.jpe?g$/i.test(file.name);
    const png = /\.png$/i.test(file.name);
    const supportedPhoto = file.type
      ? (jpeg && file.type === "image/jpeg") ||
        (png && file.type === "image/png")
      : jpeg || png;
    if (!supportedPhoto || file.size === 0) {
      setPhotoError("JPEG 또는 PNG 사진을 선택해 주세요.");
      return;
    }
    if (file.size > profilePhotoMaxBytes) {
      setPhotoError("5MB 이하의 사진을 선택해 주세요.");
      return;
    }

    setPhotoError("");
    onSelectPhoto(file);
  }

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
      <div className="grid justify-items-center gap-(--spacing-gap-small)">
        <button
          type="button"
          aria-label="프로필 사진 선택"
          disabled={uploadingPhoto}
          className="cursor-pointer rounded-(--radius-full) border-0 bg-transparent p-0 disabled:cursor-default"
          onClick={() => photoInputRef.current?.click()}
        >
          <Profile src={photoUrl} />
        </button>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          hidden
          disabled={uploadingPhoto}
          onChange={handlePhotoChange}
        />
        {uploadingPhoto && (
          <p
            role="status"
            className="typography-caption-r-regular m-0 text-(color:--fg-neutral-tertiary)"
          >
            사진을 등록하고 있어요.
          </p>
        )}
        {(photoError || photoUploadError) && (
          <p
            role="alert"
            className="typography-caption-r-regular m-0 text-(color:--fg-system-error)"
          >
            {photoError || photoUploadError}
          </p>
        )}
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
