import Link from "next/link";
import { getInvestorsWithPortfolio } from "@/lib/queries";
import { Reveal } from "@/components/Reveal";

export const revalidate = 60;

export const metadata = {
  title: "Investors · Swedish SportsTech Ecosystem",
};

const MAX_CHIPS = 12;

export default async function InvestorsPage() {
  const investors = await getInvestorsWithPortfolio();

  // Most-connected investors first — the clearest signal of relevance.
  const sorted = [...investors].sort(
    (a, b) => b.companies.length - a.companies.length
  );
  const connectedCount = sorted.filter((i) => i.companies.length > 0).length;

  return (
    <div className="container-page py-10">
      <Reveal>
        <header className="mb-8">
          <p className="eyebrow mb-3">
            <span className="h-px w-6 bg-gold" />
            Backers
          </p>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            Investors
          </h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Investors active in Swedish SportsTech. Each card shows which companies
            in this directory they back —{" "}
            <span className="font-medium text-ink">{connectedCount}</span> of{" "}
            <span className="font-medium text-ink">{sorted.length}</span> have known
            connections.
          </p>
        </header>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map(({ investor, companies }, idx) => {
          const website = investor.website
            ? investor.website.startsWith("http")
              ? investor.website
              : `https://${investor.website}`
            : null;
          const shown = companies.slice(0, MAX_CHIPS);
          const extra = companies.length - shown.length;

          return (
            <Reveal key={investor.id} delay={Math.min(idx, 8) * 50}>
              <div className="card flex h-full flex-col p-5">
              {/* Header row */}
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-navy/5 font-display text-base font-bold text-navy">
                  {(investor.name || "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-semibold text-ink">
                    {investor.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-ink-muted">
                    {investor.location && <span>{investor.location}</span>}
                    {investor.investment_stage && (
                      <span>Stage: {investor.investment_stage}</span>
                    )}
                  </div>
                </div>
              </div>

              {investor.description && (
                <p className="mt-3 line-clamp-2 text-sm text-ink-soft">
                  {investor.description}
                </p>
              )}

              {/* Connections — the key clarity fix */}
              <div className="mt-4 border-t border-line pt-4">
                {companies.length > 0 ? (
                  <>
                    <p className="mb-2 text-sm font-medium text-ink">
                      Backs {companies.length}{" "}
                      {companies.length === 1 ? "company" : "companies"} in the
                      directory
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {shown.map((c) => (
                        <Link
                          key={c.id}
                          href={`/company/${c.id}`}
                          className="chip bg-page text-ink-soft transition hover:bg-navy/5 hover:text-navy"
                        >
                          {c.name}
                        </Link>
                      ))}
                      {extra > 0 && (
                        <span className="chip bg-page text-ink-muted">
                          +{extra} more
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-ink-muted">
                    No portfolio connections recorded in this directory yet.
                  </p>
                )}
              </div>

              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-navy hover:underline"
                >
                  Website ↗
                </a>
              )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
