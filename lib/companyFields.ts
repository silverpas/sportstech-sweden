// Single source of truth for the public company form (used by both the
// "add your startup" and "suggest an edit" flows) and for sanitizing the
// data that comes back from it.

export type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "url";
  placeholder?: string;
  required?: boolean;
  half?: boolean;
};

export const FIELDS: Field[] = [
  { name: "name", label: "Company name", required: true, half: true },
  { name: "website", label: "Website", type: "url", placeholder: "https://…", half: true },
  { name: "description", label: "Description", type: "textarea", placeholder: "What does your company do?" },
  { name: "location", label: "City (HQ)", half: true },
  { name: "industry", label: "Industry", placeholder: "Football, Golf, Esport…", half: true },
  { name: "sector", label: "Sector", placeholder: "For Athletes / Executives / Fans", half: true },
  { name: "product_type", label: "Product type", placeholder: "Hardware, Software, Platform…", half: true },
  { name: "product_stage", label: "Product stage", half: true },
  { name: "funding_stage", label: "Funding stage", placeholder: "Seed, Series A…", half: true },
  { name: "founded_year", label: "Founded (year)", type: "number", half: true },
  { name: "employees", label: "No. of employees", type: "number", half: true },
  { name: "legal_name", label: "Legal name", half: true },
  { name: "raised_total_msek", label: "Total raised (MSEK)", type: "number", half: true },
];

// Only these fields may be set from the public form. moderation_status/id/
// pending_changes are controlled by the server, never the submitter.
export const TEXT_FIELDS = [
  "name",
  "website",
  "legal_name",
  "description",
  "location",
  "sector",
  "industry",
  "product_type",
  "product_stage",
  "funding_stage",
  "comment",
] as const;

export const INT_FIELDS = ["founded_year", "employees"] as const;
export const FLOAT_FIELDS = ["revenue_msek", "raised_total_msek"] as const;

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, 2000) : null;
}

function int(v: unknown): number | null {
  const text = str(v) ?? String(v ?? "");
  const cleaned = text.replace(/[\s,~]/g, "");
  let number = "";
  for (const ch of cleaned) {
    if (/\d/.test(ch)) number += ch;
    else if (number) break;
  }
  if (number === "") return null;
  const n = parseInt(number, 10);
  return Number.isFinite(n) ? n : null;
}

function float(v: unknown): number | null {
  const text = str(v) ?? String(v ?? "");
  const cleaned = text
    .replace(/\s/g, "")
    .replace(/msek/gi, "")
    .replace(",", ".")
    .replace(/~/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Whitelist + sanitize raw form input into the columns a submitter may set. */
export function sanitizeCompanyInput(body: Record<string, unknown>): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const f of TEXT_FIELDS) record[f] = str(body[f]);
  for (const f of INT_FIELDS) record[f] = int(body[f]);
  for (const f of FLOAT_FIELDS) record[f] = float(body[f]);
  return record;
}
