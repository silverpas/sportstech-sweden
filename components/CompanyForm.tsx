"use client";

import { useState } from "react";
import Link from "next/link";
import { FIELDS } from "@/lib/companyFields";
import type { Company } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  companyId?: number;
  initial?: Partial<Company>;
};

export function CompanyForm({ mode, companyId, initial }: Props) {
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const backHref = mode === "edit" && companyId ? `/company/${companyId}` : "/companies";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(formData.entries());
    if (mode === "edit" && companyId) payload.id = companyId;

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
          {mode === "edit"
            ? "Your suggested changes have been submitted and will appear once they're reviewed and approved."
            : "Your submission has been received and will appear in the directory once it's reviewed and approved."}
        </p>
        <Link href={backHref} className="btn-primary mt-6">
          {mode === "edit" ? "Back to company" : "Back to companies"}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-3xl p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const raw = initial?.[f.name as keyof Company];
          const defaultValue = raw === null || raw === undefined ? undefined : String(raw);
          return (
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
                  defaultValue={defaultValue}
                  className="field resize-y"
                />
              ) : (
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type === "number" ? "number" : "text"}
                  placeholder={f.placeholder}
                  required={f.required}
                  defaultValue={defaultValue}
                  className="field"
                />
              )}
            </div>
          );
        })}
      </div>

      {status === "error" && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center gap-4">
        <button type="submit" disabled={status === "saving"} className="btn-primary disabled:opacity-60">
          {status === "saving"
            ? "Submitting…"
            : mode === "edit"
              ? "Submit changes for review"
              : "Submit for review"}
        </button>
        <Link href={backHref} className="text-sm text-ink-soft hover:text-navy">
          Cancel
        </Link>
      </div>
    </form>
  );
}
