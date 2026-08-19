import { CompanyForm } from "@/components/CompanyForm";

export default function SubmitPage() {
  return (
    <div className="container-page py-12">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow mb-3">
          <span className="h-px w-6 bg-gold" />
          Join the map
        </p>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          Add your startup
        </h1>
        <p className="mt-2 text-ink-soft">
          Put your company on the map. Submissions are reviewed before they go
          live — only the company name is required.
        </p>
      </header>

      <CompanyForm mode="create" />
    </div>
  );
}
