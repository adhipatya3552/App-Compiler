import json
import os
from openai import OpenAI
from schemas.models import IntentOutput, SystemDesignOutput

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

SYSTEM_PROMPT = """You are a senior software architect. Given a structured app intent, design the full system architecture.

Return ONLY a valid JSON object with this exact structure — no explanation, no markdown:
{
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
    "role1": ["action1", "action2"],
    "role2": ["action1"]
  }
}

Rules:
- Every entity must have an "id" field of type "uuid"
- Every entity must have "created_at" of type "timestamp"
- permissions must cover ALL roles listed
- flows must cover the main user journeys
- field data types must be: uuid, string, text, integer, float, boolean, timestamp, json
- Return ONLY JSON, nothing else
"""

def run(intent: IntentOutput) -> SystemDesignOutput:
    intent_json = intent.model_dump_json(indent=2)

    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"App intent:\n{intent_json}"}
        ],
        temperature=0.2,
        max_tokens=3000,
        response_format={"type": "json_object"}
    )

    raw = response.choices[0].message.content
    data = json.loads(raw)
    return SystemDesignOutput(**data)