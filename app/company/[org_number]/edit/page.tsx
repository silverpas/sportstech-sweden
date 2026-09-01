import { notFound } from "next/navigation";
import { getCompany } from "@/lib/queries";
import { CompanyForm } from "@/components/CompanyForm";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ org_number: string }>;
}) {
  const { org_number: orgNumber } = await params;

  const { company } = await getCompany(orgNumber);
  if (!company) notFound();

  return (
    <div className="container-page py-12">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow mb-3">
          <span className="h-px w-6 bg-gold" />
          Keep the directory accurate
        </p>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          Suggest an edit to {company.legal_name}
        </h1>
        <p className="mt-2 text-ink-soft">
          Changes are reviewed before they go live.
        </p>
      </header>

      <CompanyForm mode="edit" orgNumber={company.org_number} initial={company} />
    </div>
  );
}
