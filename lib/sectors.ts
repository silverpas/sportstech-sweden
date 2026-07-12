// Sector → colour mapping. Colours are validated for colourblind-safe
// separation on a light surface (dataviz palette validator, --mode light).

export type SectorKey = "athletes" | "executives" | "fans" | "other";

export const SECTOR_COLORS: Record<SectorKey, string> = {
  athletes: "#1F8A54",
  executives: "#2C5FCC",
  fans: "#B5179E",
  other: "#7A8394",
};

export const SECTOR_LABELS: Record<SectorKey, string> = {
  athletes: "For Athletes",
  executives: "For Executives",
  fans: "For Fans",
  other: "Other",
};

/** Normalise a raw sector string from the data into one of our keys. */
export function sectorKey(raw: string | null | undefined): SectorKey {
  const s = (raw || "").toLowerCase();
  if (s.includes("athlet")) return "athletes";
  if (s.includes("exec")) return "executives";
  if (s.includes("fan")) return "fans";
  return "other";
}

export function sectorColor(raw: string | null | undefined): string {
  return SECTOR_COLORS[sectorKey(raw)];
}

/** The three real sectors (excludes "other") for legends. */
export const SECTOR_ORDER: SectorKey[] = ["athletes", "executives", "fans"];
