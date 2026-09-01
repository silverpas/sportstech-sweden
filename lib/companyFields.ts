// Single source of truth for the public company form (used by both the
// "add your startup" and "suggest an edit" flows) and for sanitizing the
// data that comes back from it.
//
// Only fields a company could reasonably self-report are exposed here.
// Registry-authoritative fields (board_members, share_capital, ceo, etc.)
// come from the data provider, not the public form.

export type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "url";
  placeholder?: string;
  required?: boolean;
  half?: boolean;
};

export const FIELDS: Field[] = [
  { name: "org_number", label: "Organization number", required: true, half: true, placeholder: "XXXXXX-XXXX" },
  { name: "website", label: "Website", type: "url", placeholder: "https://…", half: true },
  { name: "phone", label: "Phone", half: true },
  { name: "email", label: "Email", half: true },
  { name: "alternative_names", label: "Alternative names", half: true },
  { name: "purpose", label: "Business purpose", type: "textarea", placeholder: "What does the company do?" },
];

// Only these fields may be set from the public form. moderation_status/
// pending_changes are controlled by the server, never the submitter.
export const TEXT_FIELDS = [
  "org_number",
  "website",
  "phone",
  "email",
  "alternative_names",
  "purpose",
] as const;

export const INT_FIELDS = [] as const;
export const FLOAT_FIELDS = [] as const;

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, 2000) : null;
}

/** Whitelist + sanitize raw form input into the columns a submitter may set. */
export function sanitizeCompanyInput(body: Record<string, unknown>): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const f of TEXT_FIELDS) record[f] = str(body[f]);
  return record;
}
