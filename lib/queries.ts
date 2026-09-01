import { getPublicClient } from "./supabase";
import type { Company, Investor, Incubator } from "./types";

/**
 * Fetch all publicly visible companies. Filters to approved rows when the
 * moderation_status column exists; if it doesn't yet (setup.sql not run),
 * it falls back to returning everything so the site still works.
 */
export async function getCompanies(): Promise<Company[]> {
  const sb = getPublicClient();

  const filtered = await sb
    .from("companies")
    .select("*")
    .eq("moderation_status", "approved")
    .order("legal_name");

  if (!filtered.error) return (filtered.data as Company[]) ?? [];

  // Column probably doesn't exist yet — fall back to unfiltered.
  const all = await sb.from("companies").select("*").order("legal_name");
  return (all.data as Company[]) ?? [];
}

export async function getCompany(orgNumber: string): Promise<{
  company: Company | null;
}> {
  const sb = getPublicClient();

  const { data: company } = await sb
    .from("companies")
    .select("*")
    .eq("org_number", orgNumber)
    .single();

  return { company: (company as Company) ?? null };
}

export async function getInvestors(): Promise<Investor[]> {
  const sb = getPublicClient();
  const { data } = await sb.from("investors").select("*").order("name");
  return (data as Investor[]) ?? [];
}

export async function getIncubators(): Promise<Incubator[]> {
  const sb = getPublicClient();
  const { data } = await sb.from("incubators").select("*").order("name");
  return (data as Incubator[]) ?? [];
}

export type Stats = {
  companies: number;
  investors: number;
  incubators: number;
  totalShareCapital: number;
};

export async function getStats(companies: Company[]): Promise<Stats> {
  const sb = getPublicClient();
  const [{ count: investors }, { count: incubators }] = await Promise.all([
    sb.from("investors").select("id", { count: "exact", head: true }),
    sb.from("incubators").select("id", { count: "exact", head: true }),
  ]);

  const totalShareCapital = companies.reduce(
    (sum, c) => sum + (c.share_capital ?? 0),
    0
  );

  return {
    companies: companies.length,
    investors: investors ?? 0,
    incubators: incubators ?? 0,
    totalShareCapital: Math.round(totalShareCapital),
  };
}

/** Unique, sorted, non-empty values of a company field — for filter dropdowns. */
export function uniqueValues(companies: Company[], key: keyof Company): string[] {
  const set = new Set<string>();
  for (const c of companies) {
    const v = c[key];
    if (typeof v === "string" && v.trim()) set.add(v.trim());
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
