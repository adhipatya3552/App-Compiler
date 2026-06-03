import json
import re
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)


def clean_json_string(raw: str) -> str:
    """Strip markdown fences and whitespace from LLM output."""
    raw = raw.strip()
    # Remove ```json ... ``` or ``` ... ```
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


def try_parse_json(raw: str) -> dict | None:
    """Try to parse JSON. Return None if it fails."""
    try:
        cleaned = clean_json_string(raw)
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return None


def repair_json_with_llm(broken_json: str, schema_hint: str = "") -> dict:
    """
    Ask the LLM to fix broken JSON.
    This is targeted repair — not a full pipeline retry.
    """
    repair_prompt = f"""The following JSON is broken or invalid. Fix it and return ONLY valid JSON.
Do not add explanations. Do not use markdown. Return raw JSON only.

{f'Expected structure hint: {schema_hint}' if schema_hint else ''}

Broken JSON:
{broken_json}
"""
    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a JSON repair tool. Return only valid JSON, nothing else."},
            {"role": "user", "content": repair_prompt}
        ],
        temperature=0.0,
        max_tokens=2000,
        response_format={"type": "json_object"}
    )

    raw = response.choices[0].message.content
    result = try_parse_json(raw)
    if result is None:
        raise ValueError(f"LLM repair also failed. Raw output: {raw}")
    return result


def validate_and_repair(raw: str, schema_hint: str = "", max_attempts: int = 2) -> dict:
    """
    Main entry point for the repair engine.
    1. Try to parse as-is
    2. If fails → ask LLM to fix it (up to max_attempts times)
    Returns parsed dict or raises ValueError.
    """
    # Attempt 1: direct parse
    result = try_parse_json(raw)
    if result is not None:
        return result

    # Attempt 2+: LLM repair
    for attempt in range(max_attempts):
        try:
            result = repair_json_with_llm(raw, schema_hint)
            return result
        except ValueError:
            if attempt == max_attempts - 1:
                raise ValueError(
                    f"JSON repair failed after {max_attempts} attempts. "
                    f"Raw input was: {raw[:300]}..."
                )

    raise ValueError("Repair engine exhausted all attempts.")


def check_cross_layer_consistency(schema: dict) -> list[dict]:
    """
    Static checks (no LLM needed) for common cross-layer issues.
    Returns a list of issues found.
    """
    issues = []

    ui_pages = schema.get("ui", [])
    api_endpoints = schema.get("api", [])
    db_tables = schema.get("database", [])
    auth = schema.get("auth", {})

    # Collect sets for fast lookup
    db_table_names = {t["table_name"] for t in db_tables}
    auth_roles = set(auth.get("roles", []))
    api_paths = {e["path"] for e in api_endpoints}

    # Check 1: Every DB table must have 'id' column
    for table in db_tables:
        cols = table.get("columns", {})
        if "id" not in cols:
            issues.append({
                "layer": "db",
                "issue": f"Table '{table['table_name']}' is missing 'id' column",
                "fixed": False,
                "fix_description": None
            })

    # Check 2: UI pages accessible_by roles must exist in auth.roles
    for page in ui_pages:
        for role in page.get("accessible_by", []):
            if role not in auth_roles:
                issues.append({
                    "layer": "auth",
                    "issue": f"Role '{role}' used in UI page '{page['page_name']}' but not defined in auth.roles",
                    "fixed": False,
                    "fix_description": None
                })

    # Check 3: API endpoints roles_allowed must exist in auth.roles
    for endpoint in api_endpoints:
        for role in endpoint.get("roles_allowed", []):
            if role and role not in auth_roles:
                issues.append({
                    "layer": "auth",
                    "issue": f"Role '{role}' used in API endpoint '{endpoint['path']}' but not in auth.roles",
                    "fixed": False,
                    "fix_description": None
                })

    # Check 4: auth role_hierarchy must cover all roles
    hierarchy_roles = set(auth.get("role_hierarchy", {}).keys())
    for role in auth_roles:
        if role not in hierarchy_roles:
            issues.append({
                "layer": "auth",
                "issue": f"Role '{role}' not in role_hierarchy",
                "fixed": False,
                "fix_description": None
            })

    return issues