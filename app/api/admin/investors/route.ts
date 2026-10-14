import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

function authorized(token: string | null): boolean {
  const expected = process.env.ADMIN_TOKEN;
  return Boolean(expected) && token === expected;
}

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, 2000) : null;
}

function sanitize(body: Record<string, unknown>) {
  return {
    name: str(body.name),
    website: str(body.website),
    description: str(body.description),
    location: str(body.location),
    investment_stage: str(body.investment_stage),
    contact_name: str(body.contact_name),
    contact_email: str(body.contact_email),
  };
}

// List all investors.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!authorized(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sb = getServiceClient();
    const { data, error } = await sb.from("investors").select("*").order("name");
    if (error) throw error;
    return NextResponse.json({ investors: data ?? [] });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Create a new investor.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!authorized((body.token as string) ?? null)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const record = sanitize(body);
  if (!record.name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  try {
    const sb = getServiceClient();
    const { data, error } = await sb.from("investors").insert(record).select().single();
    if (error) throw error;
    return NextResponse.json({ investor: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Update an existing investor.
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
  const id = Number(body.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const record = sanitize(body);
  if (!record.name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from("investors")
      .update(record)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ investor: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Delete an investor.
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!authorized(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(url.searchParams.get("id"));
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  try {
    const sb = getServiceClient();
    const { error } = await sb.from("investors").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
