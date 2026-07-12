import Link from "next/link";
import type { Company } from "@/lib/types";
import { sectorColor, sectorKey, SECTOR_LABELS } from "@/lib/sectors";

export function CompanyCard({ company }: { company: Company }) {
  const initial = (company.name || "?").charAt(0).toUpperCase();
  const color = sectorColor(company.sector);
  const key = sectorKey(company.sector);

  return (
    <Link
      href={`/company/${company.id}`}
      className="card card-hover relative flex flex-col overflow-hidden p-5 pl-6"
    >
      {/* Sector accent bar */}
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: color }}
        aria-hidden
      />

      <div className="flex items-start gap-3">
        <span
          className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl font-display text-lg font-bold"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          {initial}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold text-ink">
            {company.name}
          </h3>
          {company.location && (
            <p className="text-sm text-ink-muted">{company.location}</p>
          )}
        </div>
      </div>

      {company.description && (
        <p className="mt-3 line-clamp-3 text-sm text-ink-soft">
          {company.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {company.sector && (
          <span
            className="chip"
            style={{ backgroundColor: `${color}1A`, color }}
          >
            {SECTOR_LABELS[key]}
          </span>
        )}
        {company.industry && (
          <span className="chip bg-page text-ink-soft">{company.industry}</span>
        )}
        {company.employees != null && (
          <span className="chip bg-page text-ink-muted">
            {company.employees} employees
          </span>
        )}
      </div>
    </Link>
  );
}
