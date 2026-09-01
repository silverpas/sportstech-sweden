// Sourced from a Swedish business-registry dataset, keyed by org_number
// (there is no separate numeric id).
export type Company = {
  org_number: string;
  legal_name: string | null;
  sector: string | null;
  company_type: string | null;
  foundation_date: string | null;
  registration_date: string | null;
  parent_company_name: string | null;
  parent_company_org_number: string | null;
  status: string | null;
  visitor_address: string | null;
  visitor_zip: string | null;
  visitor_city: string | null;
  postal_address: string | null;
  legal_address: string | null;
  municipality: string | null;
  county: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  industry_code: string | null;
  industry_name: string | null;
  nace_industries: string | null;
  purpose: string | null;
  board_members: string | null;
  ceo: string | null;
  share_capital: number | null;
  shareholders: string | null;
  total_shareholders: number | null;
  announcement_count: number | null;
  most_recent_announcement_date: string | null;
  trademark_count: number | null;
  alternative_names: string | null;
  gaselle: boolean | null;
  payment_remarks: boolean | null;
  mortgages: boolean | null;
  certifications: string | null;
  mergers: string | null;
  created_at?: string;
  updated_at?: string;
  moderation_status?: string | null;
  pending_changes?: Record<string, unknown> | null;
};

export type Investor = {
  id: number;
  name: string;
  website: string | null;
  description: string | null;
  location: string | null;
  investment_stage: string | null;
  contact_name: string | null;
  contact_email: string | null;
};

export type Incubator = {
  id: number;
  name: string;
  website: string | null;
  description: string | null;
  location: string | null;
  focus_area: string | null;
  contact_email: string | null;
};

export type Investment = {
  id: number;
  company_id: number;
  investor_id: number;
};
