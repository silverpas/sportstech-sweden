import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { sanitizeCompanyInput } from "@/lib/companyFields";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const sanitized = sanitizeCompanyInput(body);
  if (!sanitized.name) {
    return NextResponse.json(
      { error: "Company name is required." },
      { status: 400 }
    );
  }

  const editId = Number(body.id);
  const isEdit = Number.isFinite(editId) && editId > 0;

  try {
    const sb = getServiceClient();

    if (isEdit) {
      // A suggested edit to an already-published company: stash it as a
      // pending change for admin review, without touching the live columns.
      const { data: existing, error: findError } = await sb
        .from("companies")
        .select("id")
        .eq("id", editId)
        .single();
      if (findError || !existing) {
        return NextResponse.json({ error: "Company not found." }, { status: 404 });
      }

      const { error } = await sb
        .from("companies")
        .update({ pending_changes: sanitized })
        .eq("id", editId);
      if (error) throw error;
    } else {
      const { error } = await sb
        .from("companies")
        .insert({ ...sanitized, moderation_status: "pending" });
      if (error) throw error;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    // Most likely cause: setup.sql hasn't been run (moderation_status/
    // pending_changes column missing).
    return NextResponse.json(
      {
        error:
          "Could not save. If this persists, the database setup " +
          "(setup.sql) may not have been run yet.",
        detail: message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
