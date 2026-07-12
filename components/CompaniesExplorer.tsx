"use client";

import { useMemo, useState } from "react";
import type { Company } from "@/lib/types";
import { CompanyCard } from "./CompanyCard";
import { SectorLegend } from "./SectorLegend";

type Options = {
  sectors: string[];
  industries: string[];
  locations: string[];
  fundingStages: string[];
};

const EMPTY = "";

export function CompaniesExplorer({
  companies,
  options,
}: {
  companies: Company[];
  options: Options;
}) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState(EMPTY);
  const [industry, setIndustry] = useState(EMPTY);
  const [location, setLocation] = useState(EMPTY);
  const [funding, setFunding] = useState(EMPTY);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((c) => {
      if (q && !`${c.name} ${c.description ?? ""}`.toLowerCase().includes(q))
        return false;
      if (sector && c.sector !== sector) return false;
      if (industry && c.industry !== industry) return false;
      if (location && c.location !== location) return false;
      if (funding && c.funding_stage !== funding) return false;
      return true;
    });
  }, [companies, query, sector, industry, location, funding]);

  const anyFilter = sector || industry || location || funding || query;

  const reset = () => {
    setQuery("");
    setSector(EMPTY);
    setIndustry(EMPTY);
    setLocation(EMPTY);
    setFunding(EMPTY);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Filter rail */}
      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <div className="card p-5">
          <div className="mb-4">
            <label className="label" htmlFor="q">Search</label>
            <input
              id="q"
              className="field"
              placeholder="Company name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Select label="Sector" value={sector} onChange={setSector} options={options.sectors} />
          <Select label="Industry" value={industry} onChange={setIndustry} options={options.industries} />
          <Select label="Location" value={location} onChange={setLocation} options={options.locations} />
          <Select label="Funding stage" value={funding} onChange={setFunding} options={options.fundingStages} />

          {anyFilter && (
            <button
              onClick={reset}
              className="mt-1 text-sm font-medium text-navy hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </aside>

      {/* Results */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            <span className="font-semibold text-ink">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "company" : "companies"}
          </p>
          <SectorLegend />
        </div>

        {filtered.length === 0 ? (
          <div className="card grid place-items-center p-16 text-center">
            <p className="text-ink-soft">No companies match these filters.</p>
            {anyFilter && (
              <button onClick={reset} className="btn-ghost mt-4 text-sm">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="mb-4">
      <label className="label">{label}</label>
      <select
        className="field appearance-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
