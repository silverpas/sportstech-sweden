/** Extract a readable message from any thrown value, including
 * Supabase/Postgrest error objects that aren't real Error instances. */
export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  return "Unknown error";
}
