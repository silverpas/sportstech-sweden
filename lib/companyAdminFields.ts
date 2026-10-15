// Full field set an admin can edit directly on a company (bypasses the
// pending_changes review flow - this is for fixing/completing registry
// data, not public self-service). Grouped for the admin edit form.

export type AdminFieldType = "text" | "textarea" | "number" | "date" | "checkbox";

export type AdminField = {
  name: string;
  label: string;
  type?: AdminFieldType;
  group: string;
};

export const ADMIN_FIELD_GROUPS = [
  "Identity",
  "Location",
  "Contact",
  "Industry & sector",
  "Governance & financial",
  "Flags & records",
] as const;

export const ADMIN_FIELDS: AdminField[] = [
  // Identity
  { name: "legal_name", label: "Legal name", group: "Identity" },
  { name: "company_type", label: "Company type", group: "Identity" },
  { name: "status", label: "Status", group: "Identity" },
  { name: "foundation_date", label: "Foundation date", type: "date", group: "Identity" },
  { name: "registration_date", label: "Registration date", type: "date", group: "Identity" },
  { name: "parent_company_name", label: "Parent company name", group: "Identity" },
  { name: "parent_company_org_number", label: "Parent company org number", group: "Identity" },
  { name: "alternative_names", label: "Alternative names", group: "Identity" },

  // Location
  { name: "visitor_address", label: "Visitor address", group: "Location" },
  { name: "visitor_zip", label: "Visitor zip", group: "Location" },
  { name: "visitor_city", label: "Visitor city", group: "Location" },
  { name: "postal_address", label: "Postal address", group: "Location" },
  { name: "legal_address", label: "Legal address", group: "Location" },
  { name: "municipality", label: "Municipality", group: "Location" },
  { name: "county", label: "County", group: "Location" },
  { name: "latitude", label: "Latitude", type: "number", group: "Location" },
  { name: "longitude", label: "Longitude", type: "number", group: "Location" },

  // Contact
  { name: "phone", label: "Phone", group: "Contact" },
  { name: "email", label: "Email", group: "Contact" },
  { name: "website", label: "Website", group: "Contact" },

  // Industry & sector
  { name: "sector", label: "Sector", group: "Industry & sector" },
  { name: "industry_name", label: "Industry name", group: "Industry & sector" },
  { name: "industry_code", label: "Industry code", group: "Industry & sector" },
  { name: "nace_industries", label: "NACE industries", group: "Industry & sector" },
  { name: "purpose", label: "Purpose", type: "textarea", group: "Industry & sector" },

  // Governance & financial
  { name: "ceo", label: "CEO", group: "Governance & financial" },
  { name: "board_members", label: "Board members", type: "textarea", group: "Governance & financial" },
  { name: "shareholders", label: "Shareholders", type: "textarea", group: "Governance & financial" },
  { name: "total_shareholders", label: "Total shareholders", type: "number", group: "Governance & financial" },
  { name: "share_capital", label: "Share capital (SEK)", type: "number", group: "Governance & financial" },

  // Flags & records
  { name: "gaselle", label: "Gaselle award", type: "checkbox", group: "Flags & records" },
  { name: "payment_remarks", label: "Payment remarks", type: "checkbox", group: "Flags & records" },
  { name: "mortgages", label: "Mortgages", type: "checkbox", group: "Flags & records" },
  { name: "announcement_count", label: "Announcement count", type: "number", group: "Flags & records" },
  { name: "most_recent_announcement_date", label: "Most recent announcement", type: "date", group: "Flags & records" },
  { name: "trademark_count", label: "Trademark count", type: "number", group: "Flags & records" },
  { name: "certifications", label: "Certifications", type: "textarea", group: "Flags & records" },
  { name: "mergers", label: "Mergers", type: "textarea", group: "Flags & records" },
];

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, 4000) : null;
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Sanitize a raw admin-form submission into typed column values. */
export function sanitizeAdminInput(body: Record<string, unknown>): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const f of ADMIN_FIELDS) {
    const raw = body[f.name];
    if (f.type === "number") {
      record[f.name] = num(raw);
    } else if (f.type === "checkbox") {
      record[f.name] = Boolean(raw);
    } else if (f.type === "date") {
      record[f.name] = str(raw);
    } else {
      record[f.name] = str(raw);
    }
  }
  return record;
}
