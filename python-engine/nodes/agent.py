from graph.state import State
from graph.llm import llm

def agent_node(state: State) -> State:
    response = llm.invoke(
        state["messages"] + [
            {"role": "user", "content": state["query"]}
        ]
    )
    state["messages"].append(response)
    state["llm_result"] = response.content
    return state
