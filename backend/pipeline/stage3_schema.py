import json
import os
from openai import OpenAI
from schemas.models import IntentOutput, SystemDesignOutput, SchemaOutput

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

SYSTEM_PROMPT = """You are a senior full-stack architect. Given an app intent and system design, generate all schemas.

Return ONLY a valid JSON object with this exact structure:
{
  "ui": [
    {
      "page_name": "string",
      "route": "/path",
      "accessible_by": ["role1"],
      "components": [
        {
          "component_type": "form|table|card|chart|navbar|sidebar",
          "fields": ["field1", "field2"],
          "actions": ["submit", "cancel"]
        }
      ]
    }
  ],
  "api": [
    {
      "method": "GET|POST|PUT|DELETE",
      "path": "/api/resource",
      "description": "what this endpoint does",
      "request_body": {"field": "type"},
      "response": {"field": "type"},
      "auth_required": true,
      "roles_allowed": ["role1"]
    }
  ],
  "database": [
    {
      "table_name": "table_name",
      "columns": {
        "id": "UUID PRIMARY KEY",
        "column_name": "type constraints"
      },
      "primary_key": "id",
      "foreign_keys": ["user_id REFERENCES users(id)"]
    }
  ],
  "auth": {
    "strategy": "JWT",
    "roles": ["role1", "role2"],
    "role_hierarchy": {"admin": 2, "user": 1},
    "protected_routes": ["/api/admin", "/dashboard"]
  }
}

Critical rules:
- Every DB table must have "id" as UUID PRIMARY KEY and "created_at" timestamp
- API paths must match DB table names (e.g. /api/users maps to users table)
- UI fields must map to API request_body fields
- All roles in auth.roles must appear in role_hierarchy
- protected_routes must include all non-public routes
- Return ONLY JSON, nothing else
"""

def run(intent: IntentOutput, design: SystemDesignOutput) -> SchemaOutput:
    combined = {
        "intent": intent.model_dump(),
        "system_design": design.model_dump()
    }

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Input:\n{json.dumps(combined, indent=2)}"}
        ],
        temperature=0.2,
        max_tokens=4000,
        response_format={"type": "json_object"}
    )

    raw = response.choices[0].message.content
    data = json.loads(raw)
    return SchemaOutput(**data)