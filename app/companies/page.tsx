import { getCompanies, uniqueValues } from "@/lib/queries";
import { CompaniesExplorer } from "@/components/CompaniesExplorer";
import { Reveal } from "@/components/Reveal";

export const revalidate = 60;

export const metadata = {
  title: "Companies · Swedish SportsTech Ecosystem",
};

export default async function CompaniesPage() {
  const companies = await getCompanies();

  const options = {
    sectors: uniqueValues(companies, "sector"),
    industries: uniqueValues(companies, "industry"),
    locations: uniqueValues(companies, "location"),
    fundingStages: uniqueValues(companies, "funding_stage"),
  };

  return (
    <div className="container-page py-12">
      <Reveal>
        <header className="mb-8">
          <p className="eyebrow mb-3">
            <span className="h-px w-6 bg-gold" />
            The directory
          </p>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            Companies
          </h1>
          <p className="mt-2 text-ink-soft">
            Every startup in the Swedish SportsTech ecosystem. Search and filter to
            find them.
          </p>
        </header>
      </Reveal>

      <CompaniesExplorer companies={companies} options={options} />
    </div>
  );
}
