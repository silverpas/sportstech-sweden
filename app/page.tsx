import Link from "next/link";
import { getCompanies, getStats } from "@/lib/queries";
import { industryBreakdown, growthByYear, cityCounts } from "@/lib/charts";
import { sectorKey, SECTOR_ORDER, SECTOR_COLORS, SECTOR_LABELS } from "@/lib/sectors";
import { StatCounter } from "@/components/StatCounter";
import { Panel } from "@/components/Panel";
import { Reveal } from "@/components/Reveal";
import { IndustryChart } from "@/components/charts/IndustryChart";
import { GrowthChart } from "@/components/charts/GrowthChart";
import { SwedenMap } from "@/components/charts/SwedenMap";

export const revalidate = 60;

export default async function HomePage() {
  const companies = await getCompanies();
  const stats = await getStats(companies);
  const industries = industryBreakdown(companies);
  const growth = growthByYear(companies);
  const cities = cityCounts(companies);

  const sectorCounts = SECTOR_ORDER.map((key) => ({
    key,
    count: companies.filter((c) => sectorKey(c.sector) === key).length,
  }));
  const sectorTotal = sectorCounts.reduce((s, x) => s + x.count, 0) || 1;

  return (
    <div>
      {/* Band 1 — Immersive hero (navy), pulled up behind the transparent nav */}
      <section className="hero-navy -mt-16 border-b border-white/5">
        <div className="hero-grid" />
        <div className="container-page relative pb-20 pt-28 sm:pb-32 sm:pt-44">
          <div className="max-w-3xl animate-fade-up">
            <span className="eyebrow mb-6">
              <span className="h-px w-6 bg-gold" />
              Industry map · {new Date().getFullYear()}
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.03] text-white sm:text-7xl">
              The Swedish{" "}
              <span className="relative whitespace-nowrap">
                SportsTech
                <span className="absolute inset-x-0 -bottom-1.5 h-1.5 rounded-full bg-gold" />
              </span>{" "}
              ecosystem
            </h1>
            <p className="mt-7 max-w-2xl text-lg text-white/70 sm:text-xl">
              A living directory of the companies, investors, and incubators
              building the future of sport in Sweden.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/companies" className="btn-gold">
                Explore companies
              </Link>
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-5 py-2.5 font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
              >
                Add your startup
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Band 2 — Stats (white) */}
      <section className="bg-surface border-b border-line">
        <div className="container-page grid grid-cols-2 divide-line py-6 sm:grid-cols-4 sm:divide-x">
          <StatCounter value={stats.companies} label="Companies" />
          <StatCounter value={stats.investors} label="Investors" />
          <StatCounter value={stats.incubators} label="Incubators" />
          <StatCounter value={stats.totalRaisedMsek} label="MSEK raised" />
        </div>
      </section>

      {/* Band 3 — Data (light) */}
      <section className="bg-page">
        <div className="container-page py-16">
          <Reveal>
            <p className="eyebrow mb-3">
              <span className="h-px w-6 bg-gold" />
              The ecosystem in numbers
            </p>
            <h2 className="mb-8 font-display text-3xl font-bold text-ink">
              What it&apos;s made of
            </h2>
          </Reveal>

          <div className="space-y-5">
            <Reveal>
              <Panel title="By sector" subtitle="How companies split across the three sectors">
                <div className="flex h-4 w-full overflow-hidden rounded-full">
                  {sectorCounts.map((s) => (
                    <div
                      key={s.key}
                      style={{
                        width: `${(s.count / sectorTotal) * 100}%`,
                        backgroundColor: SECTOR_COLORS[s.key],
                      }}
                      title={`${SECTOR_LABELS[s.key]}: ${s.count}`}
                    />
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {sectorCounts.map((s) => (
                    <div key={s.key} className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: SECTOR_COLORS[s.key] }}
                      />
                      <div>
                        <div className="font-display text-lg font-semibold text-ink">
                          {s.count}
                        </div>
                        <div className="text-xs text-ink-muted">{SECTOR_LABELS[s.key]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </Reveal>

            <div className="grid gap-5 lg:grid-cols-3">
              <Reveal className="lg:col-span-2">
                <Panel title="Industries" subtitle="Companies by industry" className="h-full">
                  <IndustryChart data={industries} />
                </Panel>
              </Reveal>
              <Reveal delay={80}>
                <Panel title="Across Sweden" subtitle="Where companies are based" className="h-full">
                  <SwedenMap data={cities} />
                </Panel>
              </Reveal>
              <Reveal className="lg:col-span-3">
                <Panel
                  title="Ecosystem growth"
                  subtitle="Cumulative companies founded, by year"
                >
                  {growth.length ? (
                    <GrowthChart data={growth} />
                  ) : (
                    <p className="text-sm text-ink-muted">Not enough founding-year data yet.</p>
                  )}
                </Panel>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Band 4 — Explore (white) */}
      <section className="bg-surface border-y border-line">
        <div className="container-page py-16">
          <Reveal>
            <p className="eyebrow mb-3">
              <span className="h-px w-6 bg-gold" />
              Browse
            </p>
            <h2 className="mb-8 font-display text-3xl font-bold text-ink">
              Explore the ecosystem
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                href: "/companies",
                title: "Companies",
                count: stats.companies,
                desc: "Search and filter every startup by sector, industry, city, and funding stage.",
              },
              {
                href: "/investors",
                title: "Investors",
                count: stats.investors,
                desc: "Investors active in Swedish SportsTech and the companies they back.",
              },
              {
                href: "/incubators",
                title: "Incubators",
                count: stats.incubators,
                desc: "Incubators, accelerators, and initiatives supporting the ecosystem.",
              },
            ].map((c, i) => (
              <Reveal key={c.href} delay={i * 80}>
                <ExploreCard {...c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Band 5 — CTA (navy) */}
      <section className="hero-navy">
        <div className="hero-grid" />
        <div className="container-page relative flex flex-col items-center gap-5 py-16 text-center">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Building something in Swedish SportsTech?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Add your startup to the map. It takes a minute, and it&apos;s free.
            </p>
            <Link href="/submit" className="btn-gold mt-6">
              Add your startup
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function ExploreCard({
  href,
  title,
  count,
  desc,
}: {
  href: string;
  title: string;
  count: number;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="card card-hover group relative flex h-full flex-col overflow-hidden p-6"
    >
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
        <span className="font-display text-3xl font-bold text-navy">{count}</span>
      </div>
      <p className="mt-2 flex-1 text-sm text-ink-soft">{desc}</p>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-navy">
        Browse
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="transition-transform duration-300 group-hover:translate-x-1"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}
