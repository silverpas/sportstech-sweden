import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

// Only these fields may be set from the public form. moderation_status/id/status
// are controlled by the server, never the submitter.
const TEXT_FIELDS = [
  "name",
  "website",
  "legal_name",
  "description",
  "location",
  "sector",
  "industry",
  "product_type",
  "product_stage",
  "funding_stage",
  "comment",
] as const;

const INT_FIELDS = ["founded_year", "employees"] as const;
const FLOAT_FIELDS = ["revenue_msek", "raised_total_msek"] as const;

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, 2000) : null;
}

function int(v: unknown): number | null {
  const n = parseInt(String(v ?? "").replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function float(v: unknown): number | null {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const name = str(body.name);
  if (!name) {
    return NextResponse.json(
      { error: "Company name is required." },
      { status: 400 }
    );
  }

  const record: Record<string, unknown> = { moderation_status: "pending" };
  for (const f of TEXT_FIELDS) record[f] = str(body[f]);
  for (const f of INT_FIELDS) record[f] = int(body[f]);
  for (const f of FLOAT_FIELDS) record[f] = float(body[f]);
  record.name = name;

  try {
    const sb = getServiceClient();
    const { error } = await sb.from("companies").insert(record);
    if (error) throw error;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    // Most likely cause: setup.sql hasn't been run (moderation_status missing).
    return NextResponse.json(
      {
        error:
          "Could not save submission. If this persists, the database setup " +
          "(setup.sql) may not have been run yet.",
        detail: message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
