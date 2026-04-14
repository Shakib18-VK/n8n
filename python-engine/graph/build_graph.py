from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import tools_condition

from graph.state import State
from nodes.classifier import classification_query, route
from nodes.coding import is_coding_question
from nodes.doctor import is_doctor_question
from nodes.farmer import is_farmer_question
from nodes.advice import is_advice_question
from nodes.general import is_general_question
from nodes.agent import agent_node
from graph.llm import tool_node

def build_graph():
    graph = StateGraph(State)

    graph.add_node("classify", classification_query)

    graph.add_node("coding", is_coding_question)
    graph.add_node("doctor", is_doctor_question)
    graph.add_node("farmer", is_farmer_question)
    graph.add_node("advice", is_advice_question)
    graph.add_node("general", is_general_question)

    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)

    graph.add_edge(START, "classify")

    graph.add_conditional_edges(
        "classify",
        route,
        {
            "is_coding_question": "coding",
            "is_doctor_question": "doctor",
            "is_farmer_question": "farmer",
            "is_advice_question": "advice",
            "is_general_question": "general",
        }
    )

    # 👇 ALL category nodes go to agent
    graph.add_edge("coding", "agent")
    graph.add_edge("doctor", "agent")
    graph.add_edge("farmer", "agent")
    graph.add_edge("advice", "agent")
    graph.add_edge("general", "agent")

    # 👇 agent decides: tool or end
    graph.add_conditional_edges(
        "agent",
        tools_condition,
        {
            "tools": "tools",
            END: END,
        }
    )

    graph.add_edge("tools", "agent")

    return graph.compile()
