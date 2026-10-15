import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { errorMessage } from "@/lib/errors";
import { sanitizeAdminInput } from "@/lib/companyAdminFields";

function authorized(token: string | null): boolean {
  const expected = process.env.ADMIN_TOKEN;
  return Boolean(expected) && token === expected;
}

// List all companies (for the admin to search/select from).
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!authorized(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sb = getServiceClient();
    const { data, error } = await sb.from("companies").select("*").order("legal_name");
    if (error) throw error;
    return NextResponse.json({ companies: data ?? [] });
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}

// Directly update any field on a company - bypasses the pending_changes
// review flow. For admin corrections, not public submissions.
export async function PUT(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!authorized((body.token as string) ?? null)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orgNumber = typeof body.org_number === "string" ? body.org_number : "";
  if (!orgNumber) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const record = sanitizeAdminInput(body);

  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("companies")
      .update(record)
      .eq("org_number", orgNumber)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ company: data });
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}
