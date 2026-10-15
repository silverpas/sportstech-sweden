import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { errorMessage } from "@/lib/errors";

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
    focus_area: str(body.focus_area),
    contact_email: str(body.contact_email),
  };
}

// List all incubators.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!authorized(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sb = getServiceClient();
    const { data, error } = await sb.from("incubators").select("*").order("name");
    if (error) throw error;
    return NextResponse.json({ incubators: data ?? [] });
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}

// Create a new incubator.
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
    const { data, error } = await sb.from("incubators").insert(record).select().single();
    if (error) throw error;
    return NextResponse.json({ incubator: data });
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}

// Update an existing incubator.
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
      .from("incubators")
      .update(record)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ incubator: data });
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}

// Delete an incubator.
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
    const { error } = await sb.from("incubators").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
  }
}
