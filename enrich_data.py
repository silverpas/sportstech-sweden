"""
Enrich SportsTech Sweden company records using Claude with web search.

For every company in Supabase that is missing a description or an employee
count, this script asks Claude (claude-opus-4-8) to research the company on the
web and return a small JSON object with:
  - description
  - employees
  - status            (e.g. Active / Acquired / Closed / Unknown)
  - funding_stage     (e.g. Pre-seed / Seed / Series A / Bootstrapped ...)
  - raised_total_msek (total raised, in MSEK, if discoverable)

Only fields that come back non-empty are written, and description/employees/
raised are treated as fill-only (never overwrite existing data). status and
funding_stage are refreshed whenever Claude returns a value.

Companies are processed one at a time with a short delay to stay well under
rate limits.

Environment variables required:
  SUPABASE_URL         - Supabase project URL
  SUPABASE_KEY         - Supabase secret (service_role) key
  ANTHROPIC_API_KEY    - Anthropic API key

Usage:
  pip install supabase anthropic python-dotenv
  python enrich_data.py
"""

import os
import re
import sys
import json
import time

import anthropic
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

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")

MODEL = "claude-opus-4-8"
DELAY_SECONDS = 2.0        # pause between companies to avoid rate limits
MAX_WEB_SEARCHES = 4       # cap web searches per company (cost control)


# The JSON shape we ask Claude to return. Kept small and explicit so the model
# fills exactly these keys.
RESULT_KEYS = ("description", "employees", "status", "funding_stage", "raised_total_msek")


def build_prompt(company: dict) -> str:
    """Compose the research prompt for a single company."""
    name = company.get("name") or ""
    website = company.get("website") or "unknown"
    location = company.get("location") or "Sweden"

    return (
        f"Research the Swedish SportsTech company \"{name}\" "
        f"(website: {website}, location: {location}). "
        "Use web search to find current, factual information. Then report:\n"
        "  - description: one or two sentences on what the company does\n"
        "  - employees: approximate current number of employees (integer)\n"
        "  - status: one of Active, Acquired, Closed, or Unknown\n"
        "  - funding_stage: latest funding stage "
        "(e.g. Bootstrapped, Pre-seed, Seed, Series A, Series B, Public, Unknown)\n"
        "  - raised_total_msek: total capital raised in millions of SEK (number), if known\n\n"
        "If you cannot find a value, use null for that field (do not guess). "
        "After your research, respond with ONLY a single JSON object inside a "
        "```json fenced code block, with exactly these keys: "
        "description, employees, status, funding_stage, raised_total_msek. "
        "No prose outside the code block."
    )


# --------------------------------------------------------------------------- #
# Claude call (web search + JSON extraction)
# --------------------------------------------------------------------------- #

def research_company(client: anthropic.Anthropic, company: dict) -> dict | None:
    """
    Ask Claude to research the company with web search and return a parsed dict.
    Handles the server-side tool `pause_turn` loop. Returns None on failure.
    """
    tools = [{
        "type": "web_search_20260209",
        "name": "web_search",
        "max_uses": MAX_WEB_SEARCHES,
    }]

    user_content = build_prompt(company)
    messages = [{"role": "user", "content": user_content}]

    # Server-side web search runs an internal loop; if it hits its iteration
    # cap the response comes back with stop_reason "pause_turn" and must be
    # re-sent to continue. Bound the number of continuations.
    for _ in range(5):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=4000,
                tools=tools,
                messages=messages,
            )
        except anthropic.RateLimitError as exc:
            retry_after = int(exc.response.headers.get("retry-after", "30"))
            print(f"    rate limited; waiting {retry_after}s")
            time.sleep(retry_after)
            continue
        except anthropic.APIStatusError as exc:
            print(f"    API error {exc.status_code}: {exc.message}")
            return None
        except anthropic.APIConnectionError:
            print("    connection error; retrying in 10s")
            time.sleep(10)
            continue

        if response.stop_reason == "pause_turn":
            # Re-send the accumulated turn so the server resumes web search.
            messages = [
                {"role": "user", "content": user_content},
                {"role": "assistant", "content": response.content},
            ]
            continue

        # Normal completion — pull the text out and parse the JSON block.
        text = "".join(
            block.text for block in response.content if block.type == "text"
        )
        return parse_result(text)

    print("    gave up after too many pause_turn continuations")
    return None


def parse_result(text: str) -> dict | None:
    """Extract the JSON object from Claude's response text."""
    if not text:
        return None

    # Prefer a ```json fenced block; fall back to the last {...} in the text.
    match = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if not match:
        match = re.search(r"(\{.*\})", text, re.DOTALL)
    if not match:
        return None

    try:
        data = json.loads(match.group(1))
    except json.JSONDecodeError:
        return None

    return {key: data.get(key) for key in RESULT_KEYS}


# --------------------------------------------------------------------------- #
# Applying enrichment to Supabase
# --------------------------------------------------------------------------- #

def coerce_int(value):
    if value is None:
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return int(value)
    digits = re.sub(r"[^\d]", "", str(value))
    return int(digits) if digits else None


def coerce_float(value):
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    cleaned = str(value).replace(",", ".")
    cleaned = re.sub(r"[^\d.]", "", cleaned)
    try:
        return float(cleaned)
    except ValueError:
        return None


def clean_text(value):
    if value is None:
        return None
    text = str(value).strip()
    if not text or text.lower() in ("null", "unknown", "n/a", "none"):
        return None
    return text


def build_update(company: dict, result: dict) -> dict:
    """
    Decide which columns to write. description/employees/raised are fill-only
    (only set when currently empty). status/funding_stage refresh whenever a
    value is available.
    """
    update = {}

    description = clean_text(result.get("description"))
    if description and not company.get("description"):
        update["description"] = description

    employees = coerce_int(result.get("employees"))
    if employees is not None and not company.get("employees"):
        update["employees"] = employees

    raised = coerce_float(result.get("raised_total_msek"))
    if raised is not None and not company.get("raised_total_msek"):
        update["raised_total_msek"] = raised

    status = clean_text(result.get("status"))
    if status:
        update["status"] = status

    funding_stage = clean_text(result.get("funding_stage"))
    if funding_stage:
        update["funding_stage"] = funding_stage

    return update


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #

def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        sys.exit("ERROR: SUPABASE_URL and SUPABASE_KEY must be set.")
    if not ANTHROPIC_API_KEY:
        sys.exit("ERROR: ANTHROPIC_API_KEY must be set.")

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    # Fetch companies missing a description or an employee count.
    result = (
        supabase.table("companies")
        .select("*")
        .or_("description.is.null,employees.is.null")
        .execute()
    )
    companies = result.data or []
    print(f"Found {len(companies)} companies needing enrichment.\n")

    enriched = 0
    for index, company in enumerate(companies, start=1):
        name = company.get("name", "(unnamed)")
        print(f"[{index}/{len(companies)}] {name}")

        research = research_company(client, company)
        if not research:
            print("    no data returned; skipping")
            time.sleep(DELAY_SECONDS)
            continue

        update = build_update(company, research)
        if not update:
            print("    nothing new to write")
            time.sleep(DELAY_SECONDS)
            continue

        try:
            supabase.table("companies").update(update).eq("id", company["id"]).execute()
            enriched += 1
            print(f"    updated: {', '.join(sorted(update.keys()))}")
        except Exception as exc:
            print(f"    ! failed to update: {exc}")

        time.sleep(DELAY_SECONDS)

    print(f"\nDone. Enriched {enriched} of {len(companies)} companies.")


if __name__ == "__main__":
    main()
