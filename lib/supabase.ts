import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";

// Public (anon) key — safe for the browser and for reading public data.
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// Secret (service_role) key — server-only. Never expose to the browser.
const serviceKey = process.env.SUPABASE_KEY || "";

/**
 * Anon client — used in server components to fetch public, approved data.
 * Reads only; respects row-level security.
 */
export function getPublicClient() {
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

/**
 * Service client — server-only. Bypasses RLS. Use for writing submissions
 * (as "pending") and for admin moderation. Never import into client code.
 */
export function getServiceClient() {
  if (!serviceKey) {
    throw new Error("SUPABASE_KEY (service_role) is not set on the server.");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
