"""
Import SportsTech Sweden ecosystem data from Excel into Supabase.

Reads the mapping Excel file and populates four tables:
  - companies   (from the "Startups" sheet)
  - investors   (from the "Investors (Swedish-based)" sheet)
  - incubators  (from the "IncubatorsAcceleratorsInitative" sheet)
  - investments (link table, parsed from the "Investors" column of "Startups")

Environment variables required:
  SUPABASE_URL  - your Supabase project URL
  SUPABASE_KEY  - a service_role key (needed to bypass RLS for inserts)

Usage:
  pip install pandas openpyxl supabase python-dotenv
  python import_data.py
"""

import os
import math
import sys

import pandas as pd
from supabase import create_client, Client

try:
    from dotenv import load_dotenv
    load_dotenv()
    load_dotenv(".env.local")
except ImportError:
    pass


# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #

EXCEL_PATH = os.environ.get(
    "EXCEL_PATH",
    "/mnt/c/Users/essiapl/OneDrive - Ericsson/Desktop/"
    "SportsTech_Sweden_-_Mapping_of_the_industry_June_2026.xlsx",
)

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# Sheet names in the workbook. Matched case-insensitively / by prefix below.
STARTUPS_SHEET = "Startups"
INVESTORS_SHEET = "Investors"          # matched by prefix -> "Investors (Swedish-based)"
INCUBATORS_SHEET = "Incubators"        # matched by prefix -> "IncubatorsAccelerators..."


# --------------------------------------------------------------------------- #
# Helpers for clean, type-safe conversion
# --------------------------------------------------------------------------- #

def clean_str(value):
    """Return a stripped string, or None for NaN / empty values."""
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    text = str(value).strip()
    if text == "" or text.lower() in ("nan", "n/a", "na", "-", "none"):
        return None
    return text


def clean_int(value):
    """Return an int, or None. Handles '10-50', '1 200', floats, etc."""
    text = clean_str(value)
    if text is None:
        return None
    # Take the first number-looking chunk (handles ranges like "10-50").
    cleaned = text.replace(" ", "").replace(",", "").replace("~", "")
    number = ""
    for ch in cleaned:
        if ch.isdigit():
            number += ch
        elif number:  # stop at first non-digit after we've started
            break
    if number == "":
        return None
    try:
        return int(number)
    except ValueError:
        return None


def clean_float(value):
    """Return a float, or None. Handles comma decimals and spaces."""
    text = clean_str(value)
    if text is None:
        return None
    cleaned = (
        text.replace(" ", "")
        .replace("MSEK", "")
        .replace("msek", "")
        .replace(",", ".")
        .replace("~", "")
    )
    try:
        return float(cleaned)
    except ValueError:
        return None


def find_sheet(sheet_names, prefix):
    """Find the first sheet whose name starts with `prefix` (case-insensitive)."""
    prefix_low = prefix.lower()
    for name in sheet_names:
        if name.lower().startswith(prefix_low):
            return name
    return None


def find_all_sheets(sheet_names, prefix):
    """Find every sheet whose name starts with `prefix` (case-insensitive)."""
    prefix_low = prefix.lower()
    return [name for name in sheet_names if name.lower().startswith(prefix_low)]


def get(row, *candidates):
    """Get the first present column value from a row by trying column names."""
    for col in candidates:
        if col in row and pd.notna(row[col]):
            return row[col]
    return None


# --------------------------------------------------------------------------- #
# Import routines
# --------------------------------------------------------------------------- #

def import_investors(supabase: Client, df: pd.DataFrame) -> dict:
    """Insert investors. Returns a {lowercase_name: id} lookup map."""
    print(f"\n=== Importing investors ({len(df)} rows) ===")
    name_to_id = {}
    inserted = 0

    for _, row in df.iterrows():
        name = clean_str(get(row, "Company/Investor name", "Investor name", "Name"))
        if not name:
            continue

        record = {
            "name": name,
            "website": clean_str(get(row, "Website")),
            "description": clean_str(get(row, "Description")),
            "location": clean_str(get(row, "Location", "Location of HQ (City)")),
            "investment_stage": clean_str(get(row, "Investment stage")),
            "contact_name": clean_str(get(row, "Contact Person Name", "Contact Person")),
            "contact_email": clean_str(get(row, "Contact Person Email", "Contact Email")),
        }

        try:
            result = supabase.table("investors").insert(record).execute()
            investor_id = result.data[0]["id"]
            name_to_id[name.lower()] = investor_id
            inserted += 1
        except Exception as exc:
            print(f"  ! Failed to insert investor '{name}': {exc}")

    print(f"  Inserted {inserted} investors.")
    return name_to_id


def import_incubators(supabase: Client, df: pd.DataFrame) -> None:
    print(f"\n=== Importing incubators ({len(df)} rows) ===")
    inserted = 0

    for _, row in df.iterrows():
        name = clean_str(get(row, "Name", "Company/Investor name"))
        if not name:
            continue

        record = {
            "name": name,
            "website": clean_str(get(row, "Website")),
            "description": clean_str(get(row, "Description")),
            "location": clean_str(get(row, "Location", "Location of HQ (City)")),
            "focus_area": clean_str(get(row, "Focus area", "Focus Area")),
            "contact_email": clean_str(get(row, "Contact Email", "Contact Person Email")),
        }

        try:
            supabase.table("incubators").insert(record).execute()
            inserted += 1
        except Exception as exc:
            print(f"  ! Failed to insert incubator '{name}': {exc}")

    print(f"  Inserted {inserted} incubators.")


def import_companies(supabase: Client, df: pd.DataFrame) -> list:
    """
    Insert companies. Returns a list of (company_id, raw_investors_string)
    tuples for later linking in import_investments().
    """
    print(f"\n=== Importing companies ({len(df)} rows) ===")
    company_investor_pairs = []
    inserted = 0

    for _, row in df.iterrows():
        name = clean_str(get(row, "Company name", "Company/Investor name", "Name"))
        if not name:
            continue

        record = {
            "name": name,
            "website": clean_str(get(row, "Website")),
            "legal_name": clean_str(get(row, "Legal name")),
            "description": clean_str(get(row, "Description")),
            "location": clean_str(get(row, "Location of HQ (City)", "Location")),
            "sector": clean_str(get(row, "Sector")),
            "industry": clean_str(get(row, "Industry")),
            "product_type": clean_str(get(row, "Type", "Product type")),
            "product_stage": clean_str(get(row, "Product stage")),
            "funding_stage": clean_str(get(row, "Funding stage")),
            "founded_year": clean_int(get(row, "Founded (year)", "Founded")),
            "employees": clean_int(get(row, "No. of employees", "Employees")),
            "revenue_msek": clean_float(get(row, "Revenue, MSEK", "Revenue MSEK")),
            "raised_total_msek": clean_float(
                get(row, "Raised tot, MSEK", "Raised tot MSEK", "Raised total MSEK")
            ),
            "status": clean_str(get(row, "Status")),
            "comment": clean_str(get(row, "Comment")),
        }

        try:
            result = supabase.table("companies").insert(record).execute()
            company_id = result.data[0]["id"]
            inserted += 1

            raw_investors = clean_str(get(row, "Investors"))
            if raw_investors:
                company_investor_pairs.append((company_id, raw_investors))
        except Exception as exc:
            print(f"  ! Failed to insert company '{name}': {exc}")

    print(f"  Inserted {inserted} companies.")
    return company_investor_pairs


def import_investments(supabase: Client, pairs: list, name_to_id: dict) -> None:
    """
    Parse comma-separated investor names per company and create link rows.
    Investors not already present are created on the fly.
    """
    print(f"\n=== Importing investments (from {len(pairs)} companies) ===")
    links = 0
    created_investors = 0

    for company_id, raw_investors in pairs:
        # Split on commas; also handle "&" and "/" separators defensively.
        names = []
        for chunk in raw_investors.replace("&", ",").replace("/", ",").split(","):
            cleaned = clean_str(chunk)
            if cleaned:
                names.append(cleaned)

        for investor_name in names:
            key = investor_name.lower()

            # Create the investor if we've never seen it.
            if key not in name_to_id:
                try:
                    result = (
                        supabase.table("investors")
                        .insert({"name": investor_name})
                        .execute()
                    )
                    name_to_id[key] = result.data[0]["id"]
                    created_investors += 1
                except Exception as exc:
                    print(f"  ! Failed to create investor '{investor_name}': {exc}")
                    continue

            investor_id = name_to_id[key]
            try:
                supabase.table("investments").insert(
                    {"company_id": company_id, "investor_id": investor_id}
                ).execute()
                links += 1
            except Exception as exc:
                # Likely a duplicate link; log quietly and continue.
                print(f"  ! Failed to link company {company_id} <-> "
                      f"'{investor_name}': {exc}")

    print(f"  Created {links} investment links "
          f"({created_investors} new investors created from the Startups sheet).")


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #

def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        sys.exit(
            "ERROR: SUPABASE_URL and SUPABASE_KEY environment variables must be set.\n"
            "       Use the service_role key so inserts bypass row-level security."
        )

    if not os.path.exists(EXCEL_PATH):
        sys.exit(
            f"ERROR: Excel file not found at:\n  {EXCEL_PATH}\n"
            "Set the EXCEL_PATH environment variable to override the default location."
        )

    print(f"Reading workbook: {EXCEL_PATH}")
    workbook = pd.read_excel(EXCEL_PATH, sheet_name=None)  # all sheets
    sheet_names = list(workbook.keys())
    print(f"Sheets found: {sheet_names}")

    startups_name = find_sheet(sheet_names, STARTUPS_SHEET)
    investor_sheets = find_all_sheets(sheet_names, INVESTORS_SHEET)
    incubators_name = find_sheet(sheet_names, INCUBATORS_SHEET)

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Order matters: investors first so companies can link to them,
    # but investments run last (after companies exist).
    # Import every investor sheet (Swedish-based + Global) into one table.
    name_to_id = {}
    if investor_sheets:
        for sheet in investor_sheets:
            print(f"\n(sheet: {sheet})")
            name_to_id.update(import_investors(supabase, workbook[sheet]))
    else:
        print("  ! No Investors sheet found; skipping.")

    if incubators_name:
        import_incubators(supabase, workbook[incubators_name])
    else:
        print("  ! Incubators sheet not found; skipping.")

    pairs = []
    if startups_name:
        pairs = import_companies(supabase, workbook[startups_name])
    else:
        print("  ! Startups sheet not found; skipping.")

    import_investments(supabase, pairs, name_to_id)

    print("\nDone.")


if __name__ == "__main__":
    main()
