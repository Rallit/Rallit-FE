import participantIcon from "../../assets/icons/match-participant.svg";
import { Badge } from "./Badge";
import { Divider } from "./Divider";
import { Profile } from "./Profile";

type MatchCardProps = {
  href: string;
  dateLabel: string;
  courtName: string;
  matchType: string;
  skillLevel: string;
  price: number;
  participantCount: number;
  capacity: number;
  courtImage?: string;
} & (
  | {
      variant: "vertical";
      tags: readonly string[];
      participants?: readonly { id: string; image?: string | null }[];
    }
  | {
      variant: "list";
      recruitmentLabel: string;
      region: string;
      regionMatches?: boolean;
    }
);

const priceFormat = new Intl.NumberFormat("ko-KR");

export function MatchCard(props: MatchCardProps) {
  const { variant, href, dateLabel, courtName, matchType, skillLevel } = props;
  const vertical = variant === "vertical";
  const participantCount = `${props.participantCount}/${props.capacity}`;
  const price = (
    <span
      className={`relative max-w-full rounded-(--radius-small) bg-(--bg-layer-overlay) py-(--spacing-padding-micro) text-center text-(color:--fg-neutral-inverse) wrap-anywhere ${vertical ? "typography-label-l-bold px-(--spacing-padding-medium)" : "typography-caption-r-bold px-(--spacing-padding-small)"}`}
    >
      {priceFormat.format(props.price)}원
    </span>
  );
  const requirements = (
    <div
      className={`typography-label-r-medium flex flex-wrap items-center gap-y-(--spacing-gap-micro) ${vertical ? "gap-x-(--spacing-gap-medium) text-(color:--fg-neutral-secondary)" : "gap-x-(--spacing-gap-micro) text-(color:--fg-neutral-tertiary)"}`}
    >
      <span>{matchType}</span>
      <Divider orientation="vertical" length={16} />
      <span>{skillLevel}</span>
    </div>
  );

  return (
    <a
      href={href}
      className={`box-border grid w-full min-w-0 overflow-hidden rounded-(--radius-large) bg-(--bg-neutral-default) text-(color:--fg-neutral-default) no-underline ${vertical ? "max-w-72 shadow-[0_2px_30px_var(--gray-alpha-100)]" : "grid-cols-[min(148px,48%)_minmax(0,1fr)] gap-(--spacing-gap-medium) p-(--spacing-padding-large)"}`}
    >
      {vertical ? (
        <>
          <div className="box-border grid min-h-[172px] content-start gap-(--spacing-gap-medium) px-(--spacing-padding-extra-large) pt-(--spacing-padding-extra-large) pb-(--spacing-padding-large)">
            <div className="flex items-center justify-between gap-(--spacing-gap-micro)">
              <div className="flex min-w-0 flex-wrap gap-(--spacing-gap-micro)">
                {props.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <span className="typography-label-r-medium inline-flex shrink-0 items-center gap-(--spacing-gap-micro) text-(color:--fg-neutral-subtle)">
                <img src={participantIcon} alt="" className="block shrink-0" />
                <span className="sr-only">참가 인원 </span>
                {participantCount}
              </span>
            </div>
            <div className="grid gap-(--spacing-gap-small)">
              <div className="wrap-anywhere">
                <p className="typography-headline-bold m-0">{dateLabel}</p>
                <h3 className="typography-headline-bold m-0">{courtName}</h3>
              </div>
              {requirements}
            </div>
          </div>
          <div className="relative box-border flex h-52 items-end justify-between gap-(--spacing-gap-small) bg-(--bg-neutral-weak) p-(--spacing-padding-extra-large)">
            {props.courtImage && (
              <img
                src={props.courtImage}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            )}
            <div className="relative flex shrink-0 -space-x-4">
              {props.participants?.slice(0, 3).map(({ id, image }) => (
                <Profile key={id} src={image} size="S" />
              ))}
            </div>
            {price}
          </div>
        </>
      ) : (
        <>
          <div className="relative box-border flex h-32 items-end justify-end overflow-hidden rounded-(--radius-medium) bg-(--bg-neutral-weak) p-(--spacing-padding-small)">
            {props.courtImage && (
              <img
                src={props.courtImage}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            )}
            {price}
          </div>
          <div className="flex min-w-0 flex-col justify-between gap-(--spacing-gap-small)">
            <div className="grid gap-(--spacing-gap-small)">
              <div className="flex flex-wrap gap-(--spacing-gap-micro)">
                <Badge>
                  {props.recruitmentLabel} {participantCount}
                </Badge>
                <Badge variant={props.regionMatches ? "brand" : "blue"}>
                  {props.region}
                </Badge>
              </div>
              <div className="grid gap-(--spacing-gap-micro) wrap-anywhere">
                <p className="typography-label-l-bold m-0">{dateLabel}</p>
                <h3 className="typography-label-r-medium m-0">{courtName}</h3>
              </div>
            </div>
            {requirements}
          </div>
        </>
      )}
    </a>
  );
}
