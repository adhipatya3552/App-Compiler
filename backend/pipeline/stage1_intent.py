import json
import os
from openai import OpenAI
from schemas.models import IntentOutput

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

SYSTEM_PROMPT = """You are an expert software architect. Your job is to extract structured intent from a user's app description.

Return ONLY a valid JSON object with this exact structure — no explanation, no markdown, no extra text:
{
  "app_name": "string",
  "app_type": "string (e.g. CRM, E-commerce, Dashboard, SaaS)",
  "core_features": ["feature1", "feature2"],
  "user_roles": ["role1", "role2"],
  "auth_required": true or false,
  "payment_required": true or false,
  "assumptions": ["assumption if user was vague"]
}

Rules:
- If the user is vague, make reasonable assumptions and list them in "assumptions"
- user_roles must always include at least one role
- core_features must be specific and actionable
- Return ONLY JSON, nothing else
"""

def run(user_prompt: str) -> IntentOutput:
    response = client.chat.completions.create(
        model="openai/gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"App description: {user_prompt}"}
        ],
        temperature=0.2,
        max_tokens=2000,
        response_format={"type": "json_object"}
    )

    raw = response.choices[0].message.content
    data = json.loads(raw)
    return IntentOutput(**data)