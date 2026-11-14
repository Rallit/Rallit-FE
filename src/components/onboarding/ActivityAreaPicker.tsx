import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  getOnboardingActivityAreas,
  type ActivityArea,
} from "@/apis/onboarding";
import { BottomCTA } from "@/components/BottomCTA";
import { CascadingMenu } from "@/components/CascadingMenu";
import { BottomSheet } from "@/components/BottomSheet";
import { Select } from "@/components/Select";
import { SelectionChip } from "@/components/SelectionChip";

const maxAreas = 3;

type ActivityAreaPickerProps = {
  value: ActivityArea[];
  onChange: (value: ActivityArea[]) => void;
};

type AreaList =
  | { status: "idle" | "loading" | "error" }
  | { status: "ready"; areas: ActivityArea[] };

export function ActivityAreaPicker({
  value,
  onChange,
}: ActivityAreaPickerProps) {
  const labelId = useId();
  const dialogId = useId();
  const draftChips = useRef<HTMLDivElement>(null);
  const resetButton = useRef<HTMLButtonElement>(null);
  const removedChipIndex = useRef<number | null>(null);
  const request = useRef<AbortController | null>(null);
  const [list, setList] = useState<AreaList>({ status: "idle" });
  const [draft, setDraft] = useState<ActivityArea[] | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  useLayoutEffect(() => {
    const index = removedChipIndex.current;
    if (index === null) return;
    removedChipIndex.current = null;
    if (document.activeElement !== document.body) return;

    const buttons = draftChips.current?.querySelectorAll("button");
    (buttons?.[index] ?? buttons?.[index - 1] ?? resetButton.current)?.focus();
  }, [draft]);

  async function loadAreas() {
    if (request.current) return;

    const controller = new AbortController();
    request.current = controller;
    setList({ status: "loading" });
    try {
      const areas = await getOnboardingActivityAreas(controller.signal);
      if (!controller.signal.aborted) setList({ status: "ready", areas });
    } catch {
      if (!controller.signal.aborted) setList({ status: "error" });
    } finally {
      if (request.current === controller) request.current = null;
    }
  }

  function open(event: MouseEvent<HTMLButtonElement>) {
    event.currentTarget.focus();
    setDraft(value);
    if (list.status === "idle" || list.status === "error") void loadAreas();
  }

  function close() {
    setDraft(null);
  }

  function removeArea(id: string) {
    setDraft(
      (selection) => selection?.filter((area) => area.id !== id) ?? null,
    );
  }

  function toggleArea(id: string) {
    if (!draft || list.status !== "ready") return;
    if (draft.some((area) => area.id === id)) {
      removeArea(id);
      return;
    }
    if (draft.length >= maxAreas) return;

    const area = list.areas.find((item) => item.id === id);
    if (area) setDraft([...draft, area]);
  }

  return (
    <div className="grid gap-(--spacing-gap-medium)">
      <p
        id={labelId}
        className="typography-label-r-medium m-0 text-(color:--fg-neutral-secondary)"
      >
        주 활동 지역
      </p>
      <Select
        chips={value}
        chipTrigger="dropdown"
        onRemove={(id) => onChange(value.filter((area) => area.id !== id))}
        aria-label="주 활동 지역 선택"
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-expanded={draft !== null}
        onClick={open}
      />
      <BottomSheet
        id={dialogId}
        title="주 활동지역"
        open={draft !== null}
        onDismiss={close}
        className="h-[639px] overflow-hidden"
      >
        {draft && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain scrollbar-none">
              {list.status === "ready" && (
                <CascadingMenu
                  options={list.areas}
                  selectedIds={draft.map((area) => area.id)}
                  onToggle={toggleArea}
                />
              )}
              {list.status === "loading" && (
                <p
                  role="status"
                  className="typography-body-regular m-0 p-(--spacing-padding-large)"
                >
                  지역을 불러오는 중이에요.
                </p>
              )}
              {list.status === "error" && (
                <div className="p-(--spacing-padding-large)">
                  <p role="alert" className="typography-body-regular mt-0">
                    지역을 불러오지 못했어요.
                  </p>
                  <button type="button" onClick={loadAreas}>
                    다시 시도
                  </button>
                </div>
              )}
            </div>
            <div className="shrink-0 border-x-0 border-t border-b-0 border-solid border-(--border-neutral-weak)">
              <div className="grid gap-(--spacing-gap-micro) px-(--spacing-padding-large) pt-(--spacing-padding-small) pb-(--spacing-padding-large)">
                <p
                  role="status"
                  className="typography-caption-r-regular m-0 text-(color:--fg-neutral-tertiary)"
                >
                  {draft.length}/{maxAreas}
                </p>
                {draft.length > 0 && (
                  <div
                    ref={draftChips}
                    className="flex flex-wrap gap-(--spacing-gap-micro)"
                  >
                    {draft.map(({ id, label }, index) => (
                      <SelectionChip
                        key={id}
                        label={label}
                        onRemove={(event) => {
                          if (document.activeElement === event.currentTarget) {
                            removedChipIndex.current = index;
                          }
                          removeArea(id);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <BottomCTA
                layout="horizontal"
                primaryAction={{
                  children: "등록",
                  disabled: list.status !== "ready" || draft.length === 0,
                  onClick: () => {
                    onChange(draft);
                    close();
                  },
                }}
                secondaryAction={{
                  variant: "tertiary",
                  children: "초기화",
                  ref: resetButton,
                  onClick: () => {
                    setDraft([]);
                  },
                }}
              />
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
