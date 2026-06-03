import json
import os
from openai import OpenAI
from schemas.models import IntentOutput, SystemDesignOutput, SchemaOutput, FinalOutput, ValidationIssue
from validator.repair import check_cross_layer_consistency
from pipeline import stage4_refine

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

SYSTEM_PROMPT = """You are a senior full-stack software architect. Your job is to compile a user's natural language app description into a fully detailed, structured app configuration JSON.

You must output a single JSON object containing EXACTLY three root keys: "intent", "system_design", and "schema".

Follow this exact JSON structure:
{
  "intent": {
    "app_name": "string",
    "app_type": "string (e.g. CRM, E-commerce, Dashboard, SaaS)",
    "core_features": ["feature1", "feature2"],
    "user_roles": ["role1", "role2"],
    "auth_required": true or false,
    "payment_required": true or false,
    "assumptions": ["assumption if user was vague"]
  },
  "system_design": {
    "entities": [
      {
        "name": "EntityName",
        "fields": {
          "field_name": "data_type"
        },
        "relations": ["Entity has many OtherEntity"]
      }
    ],
    "flows": [
      {
        "name": "Flow Name",
        "steps": ["Step 1", "Step 2"]
      }
    ],
    "roles": ["role1", "role2"],
    "permissions": {
      "role1": ["action1", "action2"]
    }
  },
  "schema": {
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
      "strategy": "JWT|session|OAuth",
      "roles": ["role1", "role2"],
      "role_hierarchy": {"role1": 2, "role2": 1},
      "protected_routes": ["/path"]
    }
  }
}

CRITICAL ARCHITECTURAL RULES:
1. Every system_design entity and database table MUST have an "id" field/column of type UUID (e.g., "id": "UUID PRIMARY KEY" for DB, "id": "uuid" for design entity fields) and a "created_at" field of type timestamp.
2. Every database table primary_key MUST be "id".
3. API paths and descriptions must match DB table names (e.g. /api/users maps to users table).
4. UI component fields must map correctly to API request_body fields and database columns.
5. All roles used in the UI (accessible_by), API (roles_allowed), and System Design MUST be listed in auth.roles.
6. The auth.role_hierarchy must cover ALL roles listed in auth.roles.
7. protected_routes in auth config must include all non-public UI page routes.
8. If the user request is vague, make logical, industry-standard assumptions and list them under intent.assumptions.
9. Return ONLY the raw JSON block. No markdown fences (do not wrap in ```json), no intro text, no trailing text.
"""

def run(user_prompt: str) -> tuple[IntentOutput, SystemDesignOutput, SchemaOutput, list[ValidationIssue]]:
    print("[Unified Pipeline] Generating full configuration...")
    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"App description: {user_prompt}"}
        ],
        temperature=0.2,
        max_tokens=4000,
        response_format={"type": "json_object"}
    )
    
    raw = response.choices[0].message.content
    data = json.loads(raw)
    
    # Load into respective schema structures
    intent = IntentOutput(**data["intent"])
    design = SystemDesignOutput(**data["system_design"])
    schema = SchemaOutput(**data["schema"])
    
    # Run static checks
    static_issues = check_cross_layer_consistency(schema.model_dump())
    
    issues = [
        ValidationIssue(
            layer=issue["layer"],
            issue=issue["issue"],
            fixed=False,
            fix_description=None
        )
        for issue in static_issues
    ]
    
    # Trigger refinement only if static checks find issues
    if issues:
        print(f"[Unified Pipeline] Static validation flagged {len(issues)} issues. Running Stage 4 Refinement...")
        refined_schema, llm_issues = stage4_refine.run(intent, design, schema)
        return intent, design, refined_schema, llm_issues
        
    print("[Unified Pipeline] Config passed static validation with 0 issues.")
    return intent, design, schema, issues
