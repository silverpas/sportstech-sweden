import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany } from "@/lib/queries";
import { sectorColor, sectorKey, SECTOR_LABELS } from "@/lib/sectors";

export const revalidate = 60;

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="rounded-xl border border-line bg-page px-4 py-3">
      <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value}</dd>
    </div>
  );
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ org_number: string }>;
}) {
  const { org_number: orgNumber } = await params;

  const { company } = await getCompany(orgNumber);
  if (!company) notFound();

  const initial = (company.legal_name || "?").charAt(0).toUpperCase();
  const website = company.website
    ? company.website.startsWith("http")
      ? company.website
      : `https://${company.website}`
    : null;
  const foundedYear = company.foundation_date
    ? new Date(company.foundation_date).getFullYear()
    : null;
  const color = sectorColor(company.sector);
  const key = sectorKey(company.sector);

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-navy"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          Back to companies
        </Link>
        <Link
          href={`/company/${company.org_number}/edit`}
          className="text-sm text-ink-soft hover:text-navy"
        >
          Suggest an edit
        </Link>
      </div>

      {/* Header */}
      <div className="card relative overflow-hidden p-6 sm:p-8">
        <span className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: color }} aria-hidden />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span
            className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl font-display text-3xl font-bold"
            style={{ backgroundColor: `${color}1A`, color }}
          >
            {initial}
          </span>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
              {company.legal_name}
            </h1>
            <p className="text-sm text-ink-muted">Org. number {company.org_number}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {company.sector && (
                <span className="chip" style={{ backgroundColor: `${color}1A`, color }}>
                  {SECTOR_LABELS[key]}
                </span>
              )}
              {company.company_type && (
                <span className="chip bg-navy/5 text-navy">{company.company_type}</span>
              )}
              {company.industry_name && (
                <span className="chip bg-page text-ink-soft">{company.industry_name}</span>
              )}
              {company.status && (
                <span className="chip bg-page text-ink-muted">{company.status}</span>
              )}
            </div>
          </div>
          {website && (
            <a href={website} target="_blank" rel="noreferrer" className="btn-primary text-sm">
              Visit website
            </a>
          )}
        </div>

        {company.purpose && (
          <p className="mt-6 max-w-3xl text-ink-soft">{company.purpose}</p>
        )}
      </div>

      {/* Facts */}
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Fact label="City" value={company.visitor_city} />
        <Fact label="Municipality" value={company.municipality} />
        <Fact label="County" value={company.county} />
        <Fact label="Founded" value={foundedYear} />
        <Fact label="CEO" value={company.ceo} />
        <Fact label="Total shareholders" value={company.total_shareholders} />
        <Fact
          label="Share capital"
          value={company.share_capital != null ? `${company.share_capital.toLocaleString()} SEK` : null}
        />
        <Fact label="Phone" value={company.phone} />
        <Fact label="Email" value={company.email} />
        <Fact label="Alternative names" value={company.alternative_names} />
      </dl>

      {company.board_members && (
        <div className="mt-6 card p-5">
          <h2 className="mb-1 font-display text-base font-semibold text-ink">Board members</h2>
          <p className="text-sm text-ink-soft">{company.board_members}</p>
        </div>
      )}
    </div>
  );
}
