"use client";

import { useState } from "react";
import Link from "next/link";

type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "url";
  placeholder?: string;
  required?: boolean;
  half?: boolean;
};

const FIELDS: Field[] = [
  { name: "name", label: "Company name", required: true, half: true },
  { name: "website", label: "Website", type: "url", placeholder: "https://…", half: true },
  { name: "description", label: "Description", type: "textarea", placeholder: "What does your company do?" },
  { name: "location", label: "City (HQ)", half: true },
  { name: "industry", label: "Industry", placeholder: "Football, Golf, Esport…", half: true },
  { name: "sector", label: "Sector", placeholder: "For Athletes / Executives / Fans", half: true },
  { name: "product_type", label: "Product type", placeholder: "Hardware, Software, Platform…", half: true },
  { name: "product_stage", label: "Product stage", half: true },
  { name: "funding_stage", label: "Funding stage", placeholder: "Seed, Series A…", half: true },
  { name: "founded_year", label: "Founded (year)", type: "number", half: true },
  { name: "employees", label: "No. of employees", type: "number", half: true },
  { name: "legal_name", label: "Legal name", half: true },
  { name: "raised_total_msek", label: "Total raised (MSEK)", type: "number", half: true },
];

export default function SubmitPage() {
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="container-page py-20">
        <div className="card mx-auto max-w-lg p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-sector-athletes/10 text-sector-athletes">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Thank you!
          </h1>
          <p className="mt-2 text-ink-soft">
            Your submission has been received and will appear in the directory
            once it&apos;s reviewed and approved.
          </p>
          <Link href="/companies" className="btn-primary mt-6">
            Back to companies
          </Link>
        </div>
      </div>
    );
  }

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

      <form onSubmit={handleSubmit} className="card max-w-3xl p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div
              key={f.name}
              className={f.type === "textarea" || !f.half ? "sm:col-span-2" : ""}
            >
              <label className="label" htmlFor={f.name}>
                {f.label}
                {f.required && <span className="text-sector-fans"> *</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  id={f.name}
                  name={f.name}
                  rows={3}
                  placeholder={f.placeholder}
                  className="field resize-y"
                />
              ) : (
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type === "number" ? "number" : "text"}
                  placeholder={f.placeholder}
                  required={f.required}
                  className="field"
                />
              )}
            </div>
          ))}
        </div>

        {status === "error" && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center gap-4">
          <button type="submit" disabled={status === "saving"} className="btn-primary disabled:opacity-60">
            {status === "saving" ? "Submitting…" : "Submit for review"}
          </button>
          <Link href="/companies" className="text-sm text-ink-soft hover:text-navy">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
