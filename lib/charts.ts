import type { Company } from "./types";

export type Datum = { name: string; value: number };

/**
 * Top industries by number of companies. Everything past `top` is folded into
 * "Other" (categorical fixed-order rule: never invent a 9th color/slice).
 */
export function industryBreakdown(companies: Company[], top = 9): Datum[] {
  const counts = new Map<string, number>();
  for (const c of companies) {
    const key = (c.industry || "").trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const sorted = Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (sorted.length <= top) return sorted;
  const head = sorted.slice(0, top);
  const otherValue = sorted.slice(top).reduce((s, d) => s + d.value, 0);
  return [...head, { name: "Other", value: otherValue }];
}

export type YearPoint = { year: number; founded: number; cumulative: number };

/**
 * Companies founded per year, plus a cumulative total — the momentum curve.
 * Ignores implausible years so a stray value can't stretch the axis.
 */
export function growthByYear(companies: Company[]): YearPoint[] {
  const now = new Date().getFullYear();
  const perYear = new Map<number, number>();
  for (const c of companies) {
    const y = c.founded_year;
    if (!y || y < 1970 || y > now) continue;
    perYear.set(y, (perYear.get(y) ?? 0) + 1);
  }
  const years = Array.from(perYear.keys()).sort((a, b) => a - b);
  if (!years.length) return [];

  const points: YearPoint[] = [];
  let cumulative = 0;
  for (let y = years[0]; y <= years[years.length - 1]; y++) {
    const founded = perYear.get(y) ?? 0;
    cumulative += founded;
    points.push({ year: y, founded, cumulative });
  }
  return points;
}

export type CityPoint = { city: string; value: number };

/** Companies per HQ city, sorted descending. */
export function cityCounts(companies: Company[]): CityPoint[] {
  const counts = new Map<string, number>();
  for (const c of companies) {
    const key = (c.location || "").trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([city, value]) => ({ city, value }))
    .sort((a, b) => b.value - a.value);
}
