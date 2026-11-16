import requestPlaceholder from "../../assets/images/match-request-placeholder.png";
import { matchFormats, type MatchRequest } from "@/features/match-request/form";
import { formatRequestedNtrp } from "@/features/match-request/summary";
import { formatMatchDate } from "@/features/match-request/summary";

const nearbyDistricts = ["용산구", "서초구", "강남구", "성동구"];

export function getMockMatchRequestResults(request: MatchRequest) {
  const requestedDistricts = request.activityAreas.map(({ label }) => label);
  const [district] = requestedDistricts;
  const similarDistrict =
    nearbyDistricts.find((name) => !requestedDistricts.includes(name)) ??
    nearbyDistricts[0];
  const format = matchFormats.find(
    ({ value }) => value === request.matchFormats[0],
  );
  const minimumNtrp = request.ntrp[0];
  const [firstDate, secondDate = firstDate] = request.dates;
  const dateLabel = (date: string) =>
    `${formatMatchDate(date, " ")} ${request.startHour}시`;
  const card = {
    dateLabel: dateLabel(firstDate),
    matchType: format?.label ?? "테니스",
    skillLevel: `NTRP ${formatRequestedNtrp(minimumNtrp)} 이상`,
    price: 20000,
    participantCount: 2,
    capacity: 4,
    courtImage: requestPlaceholder,
    recruitmentLabel: "모집중",
  };

  return [
    {
      title: "딱 맞는 매치",
      matches: [
        {
          ...card,
          id: "mock-match-1",
          courtName: `${district} 테니스장 1코트`,
          region: district,
          regionMatches: true,
        },
        {
          ...card,
          id: "mock-match-2",
          dateLabel: dateLabel(secondDate),
          courtName: `${district} 테니스장 2코트`,
          region: district,
          regionMatches: true,
        },
      ],
    },
    {
      title: "비슷한 매치",
      matches: [
        {
          ...card,
          id: "mock-match-3",
          courtName: `${similarDistrict} 테니스장`,
          region: similarDistrict,
          regionMatches: false,
        },
      ],
    },
  ];
}
