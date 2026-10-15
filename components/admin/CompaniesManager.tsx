"use client";

import { useEffect, useMemo, useState } from "react";
import type { Company } from "@/lib/types";
import { ADMIN_FIELDS, ADMIN_FIELD_GROUPS } from "@/lib/companyAdminFields";

export function CompaniesManager({ token }: { token: string }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Company | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/companies?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load companies.");
      setCompanies(data.companies);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load companies.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = !q
      ? companies
      : companies.filter(
          (c) => (c.legal_name ?? "").toLowerCase().includes(q) || c.org_number.includes(q)
        );
    return base.slice(0, 30);
  }, [companies, query]);

  function selectCompany(c: Company) {
    setSelected(c);
    setSavedMsg("");
    const initial: Record<string, unknown> = {};
    for (const f of ADMIN_FIELDS) {
      const raw = (c as unknown as Record<string, unknown>)[f.name];
      if (f.type === "checkbox") {
        initial[f.name] = Boolean(raw);
      } else if (f.type === "date" && typeof raw === "string") {
        initial[f.name] = raw.slice(0, 10);
      } else {
        initial[f.name] = raw ?? "";
      }
    }
    setDraft(initial);
  }

  function setField(name: string, value: unknown) {
    setDraft((d) => ({ ...d, [name]: value }));
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError("");
    setSavedMsg("");
    try {
      const res = await fetch("/api/admin/companies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, org_number: selected.org_number, ...draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      setCompanies((list) =>
        list.map((c) => (c.org_number === selected.org_number ? data.company : c))
      );
      setSelected(data.company);
      setSavedMsg("Saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-12">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">
          Companies {companies.length > 0 && `(${companies.length})`}
        </h2>
        <button onClick={load} className="btn-ghost text-sm">
          Refresh
        </button>
      </div>
      <p className="mb-4 text-sm text-ink-muted">
        Edit any field directly — changes apply immediately, no approval step.
        For new submissions or public edit suggestions, see the list above.
      </p>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="card p-4">
          <label className="label" htmlFor="company-search">
            Search
          </label>
          <input
            id="company-search"
            className="field mb-3"
            placeholder="Name or org number…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading ? (
            <p className="text-sm text-ink-muted">Loading…</p>
          ) : (
            <div className="max-h-[480px] space-y-1 overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.org_number}
                  onClick={() => selectCompany(c)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    selected?.org_number === c.org_number
                      ? "bg-navy/10 text-navy"
                      : "text-ink-soft hover:bg-page"
                  }`}
                >
                  <div className="font-medium text-ink">{c.legal_name}</div>
                  <div className="text-xs text-ink-muted">{c.org_number}</div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-2 text-sm text-ink-muted">No matches.</p>
              )}
            </div>
          )}
        </div>

        <div>
          {!selected ? (
            <div className="card grid h-full place-items-center p-12 text-center text-ink-soft">
              Select a company to edit.
            </div>
          ) : (
            <div className="card p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {selected.legal_name}
                  </h3>
                  <p className="text-xs text-ink-muted">{selected.org_number}</p>
                </div>
                <div className="flex items-center gap-3">
                  {savedMsg && <span className="text-sm text-green-600">{savedMsg}</span>}
                  <button
                    onClick={save}
                    disabled={saving}
                    className="btn-primary text-sm disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {ADMIN_FIELD_GROUPS.map((group) => (
                  <div key={group}>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      {group}
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ADMIN_FIELDS.filter((f) => f.group === group).map((f) => (
                        <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                          <label className="label">{f.label}</label>
                          {f.type === "textarea" ? (
                            <textarea
                              className="field resize-y"
                              rows={2}
                              value={(draft[f.name] as string) ?? ""}
                              onChange={(e) => setField(f.name, e.target.value)}
                            />
                          ) : f.type === "checkbox" ? (
                            <label className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
                              <input
                                type="checkbox"
                                checked={Boolean(draft[f.name])}
                                onChange={(e) => setField(f.name, e.target.checked)}
                              />
                              Yes
                            </label>
                          ) : (
                            <input
                              type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                              className="field"
                              value={(draft[f.name] as string | number) ?? ""}
                              onChange={(e) => setField(f.name, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
