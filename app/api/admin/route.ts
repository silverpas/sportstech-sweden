import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

function authorized(token: string | null): boolean {
  const expected = process.env.ADMIN_TOKEN;
  return Boolean(expected) && token === expected;
}

// List pending submissions.
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
      .eq("moderation_status", "pending")
      .order("id", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ pending: data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Approve or reject a submission.
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
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
