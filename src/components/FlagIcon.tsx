const ISO3_TO_ISO2: Record<string, string> = {
  ARG: "AR",
  AUS: "AU",
  AUT: "AT",
  BEL: "BE",
  BIH: "BA",
  BRA: "BR",
  CAN: "CA",
  CHE: "CH",
  CIV: "CI",
  COD: "CD",
  COL: "CO",
  CPV: "CV",
  CZE: "CZ",
  CUW: "CW",
  DEU: "DE",
  DZA: "DZ",
  ECU: "EC",
  EGY: "EG",
  ESP: "ES",
  FRA: "FR",
  GHA: "GH",
  HRV: "HR",
  HTI: "HT",
  IRN: "IR",
  IRQ: "IQ",
  JOR: "JO",
  JPN: "JP",
  KOR: "KR",
  MAR: "MA",
  MEX: "MX",
  NLD: "NL",
  NOR: "NO",
  NZL: "NZ",
  PAN: "PA",
  PRT: "PT",
  PRY: "PY",
  QAT: "QA",
  SAU: "SA",
  SEN: "SN",
  SWE: "SE",
  TUN: "TN",
  TUR: "TR",
  URY: "UY",
  USA: "US",
  UZB: "UZ",
  ZAF: "ZA",
};

interface FlagIconProps {
  iso3: string;
  team: string;
  className?: string;
}

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

function EnglandFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="40" rx="6" fill="#ffffff" />
      <rect x="24" width="12" height="40" fill="#ce1126" />
      <rect y="14" width="60" height="12" fill="#ce1126" />
    </svg>
  );
}

function ScotlandFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="60" height="40" rx="6" fill="#0065bd" />
      <path d="M0 4.5L4.5 0L60 35.5L55.5 40L0 4.5Z" fill="#ffffff" />
      <path d="M55.5 0L60 4.5L4.5 40L0 35.5L55.5 0Z" fill="#ffffff" />
    </svg>
  );
}

export function FlagIcon({ iso3, team, className }: FlagIconProps) {
  if (iso3 === "ENG") {
    return (
      <span className={joinClassNames("inline-flex h-8 overflow-hidden rounded-md shadow-sm", className)}>
        <EnglandFlag className="h-full w-auto" />
      </span>
    );
  }

  if (iso3 === "SCT") {
    return (
      <span className={joinClassNames("inline-flex h-8 overflow-hidden rounded-md shadow-sm", className)}>
        <ScotlandFlag className="h-full w-auto" />
      </span>
    );
  }

  const iso2 = ISO3_TO_ISO2[iso3];
  if (!iso2) {
    return (
      <span
        aria-hidden="true"
        className={joinClassNames("inline-flex h-8 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-500", className)}
      >
        {iso3}
      </span>
    );
  }

  return (
    <span
      aria-label={`${team} flag`}
      title={`${team} flag`}
      className={joinClassNames("fi inline-flex h-8 w-10 overflow-hidden rounded-md border border-slate-200 shadow-sm", `fi-${iso2.toLowerCase()}`, className)}
    />
  );
}
