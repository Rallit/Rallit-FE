type SummaryBoxProps = {
  date: string;
  time: string;
  region: string;
  matchType: string;
  regionLabel?: string;
};

export function SummaryBox({
  date,
  time,
  region,
  matchType,
  regionLabel = "지역",
}: SummaryBoxProps) {
  const rows = [
    { label: "날짜", value: date },
    { label: "시간", value: time },
    { label: regionLabel, value: region },
    { label: "유형", value: matchType },
  ];

  return (
    <dl className="m-0 box-border flex w-full flex-col gap-(--spacing-gap-medium) rounded-(--radius-medium) bg-(--bg-neutral-weak) p-(--spacing-padding-large)">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex items-start gap-(--spacing-gap-large)">
          <dt className="typography-label-r-medium mt-0.5 shrink-0 whitespace-nowrap text-(color:--fg-neutral-tertiary)">
            {label}
          </dt>
          <dd className="typography-body-medium m-0 min-w-0 wrap-anywhere text-(color:--fg-neutral-secondary)">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
