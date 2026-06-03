import json
import os
from openai import OpenAI
from schemas.models import IntentOutput, SystemDesignOutput, SchemaOutput, FinalOutput, ValidationIssue

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

SYSTEM_PROMPT = """You are a strict schema validator and fixer.

Return ONLY a valid JSON object with EXACTLY this structure — nothing else:
{
  "schema": {
    "ui": [...],
    "api": [...],
    "database": [...],
    "auth": {...}
  },
  "issues_found": [
    {
      "layer": "ui|api|db|auth",
      "issue": "description",
      "fixed": true,
      "fix_description": "what changed"
    }
  ]
}

The "schema" key MUST contain ui, api, database, and auth — all four are required.
Do NOT wrap the output in any other keys. Do NOT return the intent or system_design.
Return ONLY JSON, nothing else.
"""

def run(intent: IntentOutput, design: SystemDesignOutput, schema: SchemaOutput) -> tuple[SchemaOutput, list[ValidationIssue]]:
    combined = {
        "intent": intent.model_dump(),
        "system_design": design.model_dump(),
        "schema": schema.model_dump()
    }

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Full app config:\n{json.dumps(combined, indent=2)}"}
        ],
        temperature=0.1,       # very low — we want deterministic fixes
        max_tokens=4000,
        response_format={"type": "json_object"}
    )

    raw = response.choices[0].message.content
    data = json.loads(raw)

    refined_schema = SchemaOutput(**data["schema"])
    issues = [ValidationIssue(**i) for i in data.get("issues_found", [])]

    return refined_schema, issues