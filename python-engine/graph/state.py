from typing_extensions import TypedDict
from typing import List, Dict, Any

class State(TypedDict):
    query: str
    llm_result: str
    route: str
    messages: List[Dict[str, Any]] 
    
