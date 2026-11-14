import { useState, type UIEvent } from "react";
import { CarouselIndicator } from "@/components/CarouselIndicator";
import { MatchCard } from "@/components/MatchCard";
import type { RecommendedMatch } from "./recommendedMatches.mock";
import { useDragScroll } from "@/hooks/useDragScroll";

const CARD_WIDTH = 288;
const CARD_GAP = 12;

type RecommendedMatchCarouselProps = {
  matches: readonly RecommendedMatch[];
};

export function RecommendedMatchCarousel({
  matches,
}: RecommendedMatchCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dragScrollHandlers = useDragScroll<HTMLUListElement>();

  const handleScroll = (event: UIEvent<HTMLUListElement>) => {
    const index = Math.round(
      event.currentTarget.scrollLeft / (CARD_WIDTH + CARD_GAP),
    );
    setActiveIndex(Math.min(matches.length - 1, Math.max(0, index)));
  };

  return (
    <section
      aria-label="추천 매치 목록"
      className="-mx-4 flex flex-col items-center gap-3"
    >
      <ul
        {...dragScrollHandlers}
        onScroll={handleScroll}
        className="relative box-border m-0 flex w-full list-none snap-x snap-mandatory gap-3 overflow-x-auto px-[calc(50%-144px)] py-0 scrollbar-none select-none"
      >
        {matches.map(({ id, ...card }, index) => {
          const active = index === activeIndex;
          const side = index < activeIndex ? "origin-right" : "origin-left";
          return (
            <li
              key={id}
              className={`flex w-72 shrink-0 snap-center items-center transition-[scale,opacity] duration-200 motion-reduce:transition-none ${active ? "" : `scale-90 opacity-40 ${side}`}`}
            >
              <MatchCard variant="vertical" href={`/matches/${id}`} {...card} />
            </li>
          );
        })}
      </ul>
      <CarouselIndicator
        currentPage={activeIndex + 1}
        totalPages={matches.length}
      />
    </section>
  );
}
