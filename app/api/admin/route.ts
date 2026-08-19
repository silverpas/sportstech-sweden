import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

function authorized(token: string | null): boolean {
  const expected = process.env.ADMIN_TOKEN;
  return Boolean(expected) && token === expected;
}

// List pending submissions and pending edit suggestions.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!authorized(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("companies")
      .select("*")
      .or("moderation_status.eq.pending,pending_changes.not.is.null")
      .order("id", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ pending: data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Approve or reject a submission, or approve/discard a suggested edit.
export async function POST(request: Request) {
  let body: { token?: string; id?: number; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!authorized(body.token ?? null)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!body.id || !["approve", "reject"].includes(body.action ?? "")) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  try {
    const sb = getServiceClient();

    const { data: row, error: findError } = await sb
      .from("companies")
      .select("pending_changes")
      .eq("id", body.id)
      .single();
    if (findError || !row) throw findError ?? new Error("Company not found.");

    if (row.pending_changes) {
      // A suggested edit to an already-published company: approve merges
      // it into the real columns, reject just discards the proposal — the
      // company itself is never touched or deleted.
      if (body.action === "approve") {
        const { error } = await sb
          .from("companies")
          .update({ ...(row.pending_changes as Record<string, unknown>), pending_changes: null })
          .eq("id", body.id);
        if (error) throw error;
      } else {
        const { error } = await sb
          .from("companies")
          .update({ pending_changes: null })
          .eq("id", body.id);
        if (error) throw error;
      }
    } else {
      // A brand-new submission awaiting its first approval.
      if (body.action === "approve") {
        const { error } = await sb
          .from("companies")
          .update({ moderation_status: "approved" })
          .eq("id", body.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("companies").delete().eq("id", body.id);
        if (error) throw error;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
