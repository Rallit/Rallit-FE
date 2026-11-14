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
import { Header } from "@/components/Header";
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

function isBackdropPress(event: MouseEvent<HTMLDialogElement>) {
  if (event.target !== event.currentTarget) return false;

  const { left, right, top, bottom } =
    event.currentTarget.getBoundingClientRect();
  return (
    event.clientX < left ||
    event.clientX >= right ||
    event.clientY < top ||
    event.clientY >= bottom
  );
}

export function ActivityAreaPicker({
  value,
  onChange,
}: ActivityAreaPickerProps) {
  const labelId = useId();
  const dialogId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const startedOnBackdrop = useRef(false);
  const draftChips = useRef<HTMLDivElement>(null);
  const resetButton = useRef<HTMLButtonElement>(null);
  const removedChipIndex = useRef<number | null>(null);
  const request = useRef<AbortController | null>(null);
  const [list, setList] = useState<AreaList>({ status: "idle" });
  const [draft, setDraft] = useState<ActivityArea[] | null>(null);
  const [limitMessage, setLimitMessage] = useState(false);

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
    dialog.current?.showModal();
    setDraft(value);
    if (list.status === "idle" || list.status === "error") void loadAreas();
  }

  function close() {
    startedOnBackdrop.current = false;
    dialog.current?.close();
    setDraft(null);
    setLimitMessage(false);
  }

  function removeArea(id: string) {
    setDraft(
      (selection) => selection?.filter((area) => area.id !== id) ?? null,
    );
    setLimitMessage(false);
  }

  function toggleArea(id: string) {
    if (!draft || list.status !== "ready") return;
    if (draft.some((area) => area.id === id)) {
      removeArea(id);
      return;
    }
    if (draft.length >= maxAreas) {
      setLimitMessage(true);
      return;
    }

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
      <dialog
        ref={dialog}
        id={dialogId}
        aria-labelledby={labelId}
        onPointerDown={(event) => {
          startedOnBackdrop.current =
            event.isPrimary && event.button === 0 && isBackdropPress(event);
        }}
        onClick={(event) => {
          if (startedOnBackdrop.current && isBackdropPress(event)) close();
          startedOnBackdrop.current = false;
        }}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        className="fixed inset-x-0 top-auto bottom-0 m-auto box-border h-[639px] max-h-[calc(100dvh_-_env(safe-area-inset-top,0px))] w-full max-w-[480px] overflow-hidden rounded-t-(--radius-large) border-0 bg-(--bg-neutral-default) p-0 pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] text-(color:--fg-neutral-default) backdrop:bg-[linear-gradient(#232323b3,#232323b3)] backdrop:bg-size-[min(100%,480px)_100%] backdrop:bg-center backdrop:bg-no-repeat"
      >
        <div className="flex h-full flex-col">
          <div className="shrink-0">
            <Header variant="sheet" title="주 활동지역" onClose={close} />
          </div>
          {draft && (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
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
              <div className="shrink-0 border-x-0 border-t border-b-0 border-solid border-(--border-neutral-weak) pb-[max(var(--spacing-padding-large),env(safe-area-inset-bottom,0px))]">
                <div className="grid gap-(--spacing-gap-micro) px-(--spacing-padding-large) pt-(--spacing-padding-small) pb-(--spacing-padding-large)">
                  <p
                    role="status"
                    className="typography-caption-r-regular m-0 text-(color:--fg-neutral-tertiary)"
                  >
                    {draft.length}/{maxAreas}
                    {limitMessage && " · 최대 3개까지 선택할 수 있어요."}
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
                            if (
                              document.activeElement === event.currentTarget
                            ) {
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
                      setLimitMessage(false);
                    },
                  }}
                />
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
