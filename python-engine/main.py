from fastapi import FastAPI
from schemas.request import QueryRequest
from graph.build_graph import build_graph
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Node Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graph = build_graph()


@app.post("/execute")
def execute(req: QueryRequest):

    state = {
        "query": req.query,
        "route": "",
        "llm_result": "",
        "messages": []
    }

    result = graph.invoke(state)

    llm_result = result.get("llm_result", "")

    # Gemini/LangChain response se ONLY text nikalo
    if isinstance(llm_result, list):
        text = ""

        for item in llm_result:
            if isinstance(item, dict) and item.get("type") == "text":
                text = item.get("text", "")
                break

        llm_result = text

    elif isinstance(llm_result, dict):
        llm_result = llm_result.get("text", "")

    return {
        "result": llm_result,
        "route": result.get("route", "")
    }