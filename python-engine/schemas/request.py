from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=1,
        description="User input query (question / problem / request) Note--> You must return your final answer strictly as a plain text string. Never wrap the response in a JSON object or use keys like type, text, or extras. Output only raw text."
    )
