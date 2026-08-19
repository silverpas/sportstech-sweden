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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) notFound();

  const { company, investors } = await getCompany(numericId);
  if (!company) notFound();

  const initial = (company.name || "?").charAt(0).toUpperCase();
  const color = sectorColor(company.sector);
  const website = company.website
    ? company.website.startsWith("http")
      ? company.website
      : `https://${company.website}`
    : null;

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
          href={`/company/${company.id}/edit`}
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
              {company.name}
            </h1>
            {company.legal_name && company.legal_name !== company.name && (
              <p className="text-sm text-ink-muted">{company.legal_name}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {company.sector && (
                <span className="chip" style={{ backgroundColor: `${color}1A`, color }}>
                  {SECTOR_LABELS[sectorKey(company.sector)]}
                </span>
              )}
              {company.industry && (
                <span className="chip bg-page text-ink-soft">{company.industry}</span>
              )}
              {company.funding_stage && (
                <span className="chip bg-navy/5 text-navy">{company.funding_stage}</span>
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

        {company.description && (
          <p className="mt-6 max-w-3xl text-ink-soft">{company.description}</p>
        )}
      </div>

      {/* Facts */}
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Fact label="Location" value={company.location} />
        <Fact label="Founded" value={company.founded_year} />
        <Fact label="Employees" value={company.employees} />
        <Fact label="Product type" value={company.product_type} />
        <Fact label="Product stage" value={company.product_stage} />
        <Fact label="Revenue" value={company.revenue_msek != null ? `${company.revenue_msek} MSEK` : null} />
        <Fact label="Total raised" value={company.raised_total_msek != null ? `${company.raised_total_msek} MSEK` : null} />
        <Fact label="Funding stage" value={company.funding_stage} />
      </dl>

      {company.comment && (
        <div className="mt-6 card p-5">
          <h2 className="mb-1 font-display text-base font-semibold text-ink">Notes</h2>
          <p className="text-sm text-ink-soft">{company.comment}</p>
        </div>
      )}

      {/* Investors */}
      <div className="mt-6 card p-5 sm:p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">
          Investors <span className="text-ink-muted">({investors.length})</span>
        </h2>
        {investors.length ? (
          <div className="flex flex-wrap gap-2">
            {investors.map((inv) => (
              <span
                key={inv.id}
                className="chip bg-page text-ink-soft"
                title={inv.description ?? undefined}
              >
                {inv.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-muted">No investors recorded.</p>
        )}
      </div>
    </div>
  );
}
