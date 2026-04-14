from fastapi import FastAPI
from schemas.request import QueryRequest
from graph.build_graph import build_graph
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Node Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # production me frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graph = build_graph()   # 🔥 graph ek baar load hota hai


@app.post("/execute")
def execute(req: QueryRequest):
    state = {
        "query": req.query,
        "route": "",          # classifier set karega
        "llm_result": "",     # final output
        "messages": []        # 🔥 REQUIRED for agent + tools
    }

    result = graph.invoke(state)

    return {
        "result": result.get("llm_result"),
        "route": result.get("route")
    }
