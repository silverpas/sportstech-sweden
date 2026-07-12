"use client";

import { useState } from "react";
import type { Company } from "@/lib/types";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [pending, setPending] = useState<Company[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(tk: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin?token=${encodeURIComponent(tk)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load.");
      setPending(data.pending);
      setAuthed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  async function act(id: number, action: "approve" | "reject") {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");
      setPending((p) => p.filter((c) => c.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    }
  }

  if (!authed) {
    return (
      <div className="container-page py-16">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(token);
          }}
          className="card mx-auto max-w-sm p-6"
        >
          <h1 className="mb-4 font-display text-xl font-semibold text-ink">Admin</h1>
          <label className="label" htmlFor="token">Admin password</label>
          <input
            id="token"
            type="password"
            className="field"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary mt-4 w-full">
            {loading ? "Checking…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">
          Pending submissions
        </h1>
        <button onClick={() => load(token)} className="btn-ghost text-sm">
          Refresh
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {pending.length === 0 ? (
        <div className="card grid place-items-center p-16 text-center text-ink-soft">
          No pending submissions. 🎉
        </div>
      ) : (
        <div className="grid gap-4">
          {pending.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold text-ink">
                    {c.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
                    {c.location && <span>{c.location}</span>}
                    {c.sector && <span>{c.sector}</span>}
                    {c.industry && <span>{c.industry}</span>}
                    {c.funding_stage && <span>{c.funding_stage}</span>}
                    {c.website && <span className="text-navy">{c.website}</span>}
                  </div>
                  {c.description && (
                    <p className="mt-2 max-w-2xl text-sm text-ink-soft">
                      {c.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => act(c.id, "approve")}
                    className="rounded-lg bg-sector-athletes px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => act(c.id, "reject")}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
