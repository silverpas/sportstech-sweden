import { getIncubators } from "@/lib/queries";
import { Reveal } from "@/components/Reveal";

export const revalidate = 60;

export const metadata = {
  title: "Incubators · Swedish SportsTech Ecosystem",
};

export default async function IncubatorsPage() {
  const incubators = await getIncubators();

  return (
    <div className="container-page py-10">
      <Reveal>
        <header className="mb-8">
          <p className="eyebrow mb-3">
            <span className="h-px w-6 bg-gold" />
            Support &amp; programs
          </p>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            Incubators &amp; Accelerators
          </h1>
          <p className="mt-2 text-ink-soft">
            Programs and initiatives supporting the Swedish SportsTech ecosystem.
          </p>
        </header>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2">
        {incubators.map((inc, idx) => {
          const website = inc.website
            ? inc.website.startsWith("http")
              ? inc.website
              : `https://${inc.website}`
            : null;

          return (
            <Reveal key={inc.id} delay={Math.min(idx, 8) * 50}>
              <div className="card flex h-full flex-col p-6">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-gold/15 font-display text-lg font-bold text-navy">
                  {(inc.name || "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {inc.name}
                  </h3>
                  {inc.location && (
                    <p className="text-sm text-ink-muted">{inc.location}</p>
                  )}
                  {inc.focus_area && (
                    <span className="chip mt-2 bg-navy/5 text-navy">
                      {inc.focus_area}
                    </span>
                  )}
                </div>
              </div>

              {inc.description && (
                <p className="mt-4 flex-1 text-sm text-ink-soft">
                  {inc.description}
                </p>
              )}

              {(website || inc.contact_email) && (
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost !py-2 text-sm"
                    >
                      Visit website
                    </a>
                  )}
                  {inc.contact_email && (
                    <a
                      href={`mailto:${inc.contact_email}`}
                      className="text-sm text-ink-soft hover:text-navy"
                    >
                      {inc.contact_email}
                    </a>
                  )}
                </div>
              )}
              </div>
            </Reveal>
          );
        })}
      </div>

      {incubators.length === 0 && (
        <p className="text-ink-muted">No incubators recorded yet.</p>
      )}
    </div>
  );
}
