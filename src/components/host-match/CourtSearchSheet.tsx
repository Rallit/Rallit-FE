import { useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import { SearchField } from "@/components/SearchField";
import { searchCourts, type CourtOption } from "@/features/host-match/form";
import { CourtListItem } from "./CourtListItem";

type CourtSearchSheetProps = {
  id: string;
  open: boolean;
  courts: readonly CourtOption[];
  onSelect: (court: CourtOption) => void;
  onDismiss: () => void;
};

export function CourtSearchSheet({
  id,
  open,
  courts,
  onSelect,
  onDismiss,
}: CourtSearchSheetProps) {
  const [keyword, setKeyword] = useState("");
  const searching = keyword.trim() !== "";
  const results = searchCourts(courts, keyword);

  return (
    <BottomSheet
      id={id}
      title="코트 찾기"
      open={open}
      onDismiss={() => {
        setKeyword("");
        onDismiss();
      }}
      backdrop="overlay"
      className="h-[640px] overflow-hidden"
    >
      {(dismiss) => (
        <>
          <div className="px-(--spacing-padding-large) pt-[15px]">
            <SearchField
              aria-label="코트 검색"
              placeholder="코트 이름, 초성"
              value={keyword}
              onValueChange={setKeyword}
            />
          </div>
          <div className="mt-[15px] min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            {!searching && (
              <h3 className="typography-headline-bold m-0 px-(--spacing-padding-large) py-(--spacing-padding-medium)">
                근처에 있는 코트
              </h3>
            )}
            <ul className="m-0 list-none p-0">
              {results.map((court) => (
                <li key={court.id}>
                  <CourtListItem
                    court={court}
                    onSelect={() => dismiss(() => onSelect(court))}
                  />
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </BottomSheet>
  );
}
