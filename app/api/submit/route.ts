import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { sanitizeCompanyInput } from "@/lib/companyFields";
import { errorMessage } from "@/lib/errors";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const sanitized = sanitizeCompanyInput(body);
  if (!sanitized.org_number) {
    return NextResponse.json(
      { error: "Organization number is required." },
      { status: 400 }
    );
  }

  try {
    const sb = getServiceClient();

    const { data: existing } = await sb
      .from("companies")
      .select("org_number")
      .eq("org_number", sanitized.org_number)
      .maybeSingle();

    if (existing) {
      // A suggested edit to an already-published company: stash it as a
      // pending change for admin review, without touching the live columns.
      const { error } = await sb
        .from("companies")
        .update({ pending_changes: sanitized })
        .eq("org_number", sanitized.org_number);
      if (error) throw error;
    } else {
      const { error } = await sb
        .from("companies")
        .insert({ ...sanitized, moderation_status: "pending" });
      if (error) throw error;
    }
  } catch (e) {
    const message = errorMessage(e);
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
