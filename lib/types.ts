export type Company = {
  id: number;
  name: string;
  website: string | null;
  legal_name: string | null;
  description: string | null;
  location: string | null;
  sector: string | null;
  industry: string | null;
  product_type: string | null;
  product_stage: string | null;
  funding_stage: string | null;
  founded_year: number | null;
  employees: number | null;
  revenue_msek: number | null;
  raised_total_msek: number | null;
  status: string | null;
  comment: string | null;
  moderation_status?: string | null;
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
