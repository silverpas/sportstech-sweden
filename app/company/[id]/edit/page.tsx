import { notFound } from "next/navigation";
import { getCompany } from "@/lib/queries";
import { CompanyForm } from "@/components/CompanyForm";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) notFound();

  const { company } = await getCompany(numericId);
  if (!company) notFound();

  return (
    <div className="container-page py-12">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow mb-3">
          <span className="h-px w-6 bg-gold" />
          Keep the directory accurate
        </p>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          Suggest an edit to {company.name}
        </h1>
        <p className="mt-2 text-ink-soft">
          Changes are reviewed before they go live.
        </p>
      </header>

      <CompanyForm mode="edit" companyId={company.id} initial={company} />
    </div>
  );
}
