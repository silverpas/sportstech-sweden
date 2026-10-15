"use client";

import { useEffect, useState } from "react";
import type { Incubator } from "@/lib/types";

type Draft = {
  name: string;
  website: string;
  description: string;
  location: string;
  focus_area: string;
  contact_email: string;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  website: "",
  description: "",
  location: "",
  focus_area: "",
  contact_email: "",
};

function toDraft(incubator: Incubator): Draft {
  return {
    name: incubator.name ?? "",
    website: incubator.website ?? "",
    description: incubator.description ?? "",
    location: incubator.location ?? "",
    focus_area: incubator.focus_area ?? "",
    contact_email: incubator.contact_email ?? "",
  };
}

export function IncubatorsManager({ token }: { token: string }) {
  const [incubators, setIncubators] = useState<Incubator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY_DRAFT);
  const [newDraft, setNewDraft] = useState<Draft>(EMPTY_DRAFT);
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/incubators?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load incubators.");
      setIncubators(data.incubators);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load incubators.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createIncubator(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/admin/incubators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...newDraft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add incubator.");
      setIncubators((list) =>
        [...list, data.incubator].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewDraft(EMPTY_DRAFT);
      setAdding(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add incubator.");
    }
  }

  async function saveEdit(id: number) {
    setError("");
    try {
      const res = await fetch("/api/admin/incubators", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, id, ...editDraft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      setIncubators((list) => list.map((inc) => (inc.id === id ? data.incubator : inc)));
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    }
  }

  async function removeIncubator(id: number, name: string) {
    const ok = window.confirm(`Delete "${name}"? This cannot be undone.`);
    if (!ok) return;
    setError("");
    try {
      const res = await fetch(
        `/api/admin/incubators?token=${encodeURIComponent(token)}&id=${id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");
      setIncubators((list) => list.filter((inc) => inc.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete.");
    }
  }

  return (
    <div className="mt-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">
          Incubators {incubators.length > 0 && `(${incubators.length})`}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setAdding((v) => !v)} className="btn-ghost text-sm">
            {adding ? "Cancel" : "Add incubator"}
          </button>
          <button onClick={load} className="btn-ghost text-sm">
            Refresh
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {adding && (
        <form onSubmit={createIncubator} className="card mb-4 grid gap-3 p-5 sm:grid-cols-2">
          <DraftFields draft={newDraft} onChange={setNewDraft} />
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary text-sm">
              Save incubator
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : incubators.length === 0 ? (
        <div className="card grid place-items-center p-12 text-center text-ink-soft">
          No incubators yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {incubators.map((inc) =>
            editingId === inc.id ? (
              <form
                key={inc.id}
                onSubmit={(e) => {
                  e.preventDefault();
                  saveEdit(inc.id);
                }}
                className="card grid gap-3 p-5 sm:grid-cols-2"
              >
                <DraftFields draft={editDraft} onChange={setEditDraft} />
                <div className="flex gap-2 sm:col-span-2">
                  <button type="submit" className="btn-primary text-sm">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="btn-ghost text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div key={inc.id} className="card flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold text-ink">{inc.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
                    {inc.location && <span>{inc.location}</span>}
                    {inc.focus_area && <span>Focus: {inc.focus_area}</span>}
                    {inc.website && <span className="text-navy">{inc.website}</span>}
                    {inc.contact_email && <span>{inc.contact_email}</span>}
                  </div>
                  {inc.description && (
                    <p className="mt-2 max-w-2xl text-sm text-ink-soft">{inc.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(inc.id);
                      setEditDraft(toDraft(inc));
                    }}
                    className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink-soft transition hover:bg-page"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeIncubator(inc.id, inc.name)}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function DraftFields({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
}) {
  function set<K extends keyof Draft>(key: K, value: string) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <>
      <div>
        <label className="label">Name *</label>
        <input className="field" value={draft.name} onChange={(e) => set("name", e.target.value)} required />
      </div>
      <div>
        <label className="label">Website</label>
        <input className="field" value={draft.website} onChange={(e) => set("website", e.target.value)} />
      </div>
      <div>
        <label className="label">Location</label>
        <input className="field" value={draft.location} onChange={(e) => set("location", e.target.value)} />
      </div>
      <div>
        <label className="label">Focus area</label>
        <input
          className="field"
          value={draft.focus_area}
          onChange={(e) => set("focus_area", e.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Contact email</label>
        <input
          className="field"
          value={draft.contact_email}
          onChange={(e) => set("contact_email", e.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Description</label>
        <textarea
          className="field resize-y"
          rows={2}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
    </>
  );
}
