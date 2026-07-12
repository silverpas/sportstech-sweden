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
    .order("name");

  if (!filtered.error) return (filtered.data as Company[]) ?? [];

  // Column probably doesn't exist yet — fall back to unfiltered.
  const all = await sb.from("companies").select("*").order("name");
  return (all.data as Company[]) ?? [];
}

export async function getCompany(id: number): Promise<{
  company: Company | null;
  investors: Investor[];
}> {
  const sb = getPublicClient();

  const { data: company } = await sb
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (!company) return { company: null, investors: [] };

  // Find this company's investors via the investments link table.
  const { data: links } = await sb
    .from("investments")
    .select("investor_id")
    .eq("company_id", id);

  const investorIds = (links ?? []).map((l) => l.investor_id);
  let investors: Investor[] = [];
  if (investorIds.length) {
    const { data } = await sb
      .from("investors")
      .select("*")
      .in("id", investorIds)
      .order("name");
    investors = (data as Investor[]) ?? [];
  }

  return { company: company as Company, investors };
}

export async function getInvestorsWithPortfolio(): Promise<
  { investor: Investor; companies: { id: number; name: string }[] }[]
> {
  const sb = getPublicClient();

  const [{ data: investors }, { data: links }, { data: companies }] =
    await Promise.all([
      sb.from("investors").select("*").order("name"),
      sb.from("investments").select("company_id, investor_id"),
      sb.from("companies").select("id, name"),
    ]);

  const companyById = new Map<number, string>(
    (companies ?? []).map((c) => [c.id, c.name])
  );

  const byInvestor = new Map<number, { id: number; name: string }[]>();
  for (const link of links ?? []) {
    const name = companyById.get(link.company_id);
    if (!name) continue;
    const list = byInvestor.get(link.investor_id) ?? [];
    list.push({ id: link.company_id, name });
    byInvestor.set(link.investor_id, list);
  }

  return (investors as Investor[] ?? []).map((investor) => ({
    investor,
    companies: (byInvestor.get(investor.id) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
  }));
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
  totalRaisedMsek: number;
};

export async function getStats(companies: Company[]): Promise<Stats> {
  const sb = getPublicClient();
  const [{ count: investors }, { count: incubators }] = await Promise.all([
    sb.from("investors").select("id", { count: "exact", head: true }),
    sb.from("incubators").select("id", { count: "exact", head: true }),
  ]);

  const totalRaisedMsek = companies.reduce(
    (sum, c) => sum + (c.raised_total_msek ?? 0),
    0
  );

  return {
    companies: companies.length,
    investors: investors ?? 0,
    incubators: incubators ?? 0,
    totalRaisedMsek: Math.round(totalRaisedMsek),
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
