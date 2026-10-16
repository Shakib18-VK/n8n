from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import tools_condition
from langchain_core.messages import HumanMessage

from graph.state import State

from nodes.classifier import classification_query, route
from nodes.coding import is_coding_question
from nodes.doctor import is_doctor_question
from nodes.farmer import is_farmer_question
from nodes.advice import is_advice_question
from nodes.general import is_general_question
from nodes.agent import agent_node
from nodes.travel_node import travel_node
from nodes.restaurant_node import restaurant_node
from nodes.places_node import places_node
from nodes.news_node import news_node
from nodes.youtube_node import youtube_node

from tools.train import get_live_train_status
from tools.web import realtime_web_search
from tools.job import find_jobs_from_query
from tools.youtube import summarize_video
from tools.sports import get_live_cricket_score
from tools.weather_decision import get_weather
from graph.llm import tool_node

import re

def weather_node(state: State):

    query = state["query"]

    print("🌦️ WEATHER:", query)

    result = get_weather.invoke({
        "latitude": 23.2599,
        "longitude": 77.4126
    })

    print("🌦️ WEATHER RESULT:", result)

    return {
        "messages": state["messages"] + [
            HumanMessage(
                content=f"""
The user asked:

{query}

Here is the REAL-TIME WEATHER API RESULT:

{result}

Answer the user's original question using ONLY this weather data.

IMPORTANT:
- Do not invent weather information.
- Use the weather data provided above.
- Consider temperature, rain probability, humidity, wind speed and weather condition.
- If the user asks about tomorrow, use tomorrow's forecast data.
- If the user asks for a recommendation, give a practical recommendation based on the weather data.
- If the required information is not available, clearly say so.
- Keep the answer concise.
"""
            )
        ],
        "llm_result": str(result)
    }


def sports_node(state: State):

    query = state["query"]

    print("🏏 SPORTS:", query)

    result = get_live_cricket_score.invoke({})

    print("🏏 SPORTS RESULT:", result)

    return {
        "messages": state["messages"] + [
            HumanMessage(
                content=f"""
The user asked:

{query}

Here is the REAL-TIME CRICKET API RESULT:

{result}

Answer the user's original question using this API result.

IMPORTANT:
- Do not say you don't have access to live cricket data.
- Do not invent scores, wickets, overs, players or match information.
- Use only the API result.
- If the information is unavailable, clearly say so.
- Keep the answer concise.
"""
            )
        ],
        "llm_result": str(result)
    }

def youtube_node(state: State):
    query = state["query"]

    print("🎥 YOUTUBE:", query)

    # YouTube URL query se extract karo
    match = re.search(
        r"https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[^\s]+",
        query
    )

    if not match:
        return {
            "llm_result": "Please provide a valid YouTube video link."
        }

    video_link = match.group()

    print("🎥 VIDEO LINK:", video_link)

    result = summarize_video.invoke({
        "video_link": video_link
    })

    print("🎥 SUMMARY RESULT:", result)

    return {
        "messages": state["messages"] + [
            HumanMessage(
                content=f"""
The user asked:

{query}

Here is the YouTube video summary:

{result}

Answer the user's original question using this summary.
Do not invent information.
"""
            )
        ],
        "llm_result": str(result)
    }


def job_node(state: State):
    query = state["query"]

    print("💼 JOB SEARCH:", query)

    result = find_jobs_from_query.invoke({
        "user_query": query
    })

    print("💼 JOB RESULT:", result)

    return {
        "messages": state["messages"] + [
            HumanMessage(
                content=f"""
The user asked:

{query}

Here are the latest job search results:

{result}

Answer the user's original question using these results.

IMPORTANT:
- Use only the job data provided.
- Do not invent jobs.
- Mention relevant job title, company, location and application link.
- Keep the answer clear and concise.
"""
            )
        ],
        "llm_result": str(result)
    }

def train_node(state: State):

    query = state["query"]

    # Extract train number
    match = re.search(r"\b\d{4,5}\b", query)

    if not match:
        return {
            "llm_result": "Please provide a valid train number."
        }

    train_number = match.group()

    print("🚆 Train number:", train_number)

    # Call actual tool
    result = get_live_train_status.invoke({
        "train_number": train_number
    })

    print("🚆 API RESULT:", result)

    # Send API result to agent
    return {
        "messages": state["messages"] + [
            HumanMessage(
                content=f"""
The user asked for the live status of train {train_number}.

Here is the REAL-TIME API RESULT:

{result}

Answer the user's original question using this API data.

IMPORTANT:
- Do not say you don't have access to live train data.
- Do not ask for the train name.
- Do not invent information.
- Use only the API result.
"""
            )
        ],
        "llm_result": str(result)
    }


def web_node(state: State):
    query = state["query"]

    print("🌐 WEB SEARCH:", query)

    result = realtime_web_search.invoke({
        "query": query
    })

    print("🌐 WEB RESULT:", result)

    return {
        "messages": state["messages"] + [
            HumanMessage(
                content=f"""
The user asked:

{query}

Here are the latest web search results:

{result}

Answer the user's original question using these search results.

IMPORTANT:
- Use the search results as your source.
- Do not invent information.
- If the search results do not contain the answer, say so.
- Give a clear and concise answer.
"""
            )
        ],
        "llm_result": str(result)
    }

def build_graph():

    graph = StateGraph(State)

    # Nodes
    graph.add_node("classify", classification_query)

    graph.add_node("coding", is_coding_question)
    graph.add_node("doctor", is_doctor_question)
    graph.add_node("farmer", is_farmer_question)
    graph.add_node("advice", is_advice_question)
    graph.add_node("general", is_general_question)
    graph.add_node("travel_node", travel_node)
    graph.add_node("restaurant_node", restaurant_node)
    graph.add_node("places_node", places_node)
    graph.add_node("news_node",  news_node)
    graph.add_node("youtube_node", youtube_node)

    # IMPORTANT
    graph.add_node("train", train_node)
    graph.add_node("web", web_node)
    graph.add_node("job", job_node)
    graph.add_node("sports", sports_node)
    graph.add_node("weather_decision", weather_node)
    

    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)
    graph.add_node("youtube", youtube_node)

    # START
    graph.add_edge(START, "classify")

    # CLASSIFIER ROUTING
    graph.add_conditional_edges(
        "classify",
        route,
        {
            "is_coding_question": "coding",
            "is_doctor_question": "doctor",
            "is_farmer_question": "farmer",
            "is_advice_question": "advice",
            "is_general_question": "general",
            "get_live_train_status": "train",
            "realtime_web_search" : "web",
            "find_jobs_from_query" : "job",
            "summarize_video" : "youtube",
            "travel_node" : "travel_node",
            "get_live_cricket_score" : "sports",
            "get_weather" : "weather_decision",
            "restaurant_node" : "restaurant_node",
            "places_node" : "places_node",
            "news_node" : "news_node",
            "youtube_node" : "youtube_node"
        }
    )

    # Other nodes → agent
    graph.add_edge("coding", "agent")
    graph.add_edge("doctor", "agent")
    graph.add_edge("farmer", "agent")
    graph.add_edge("advice", "agent")
    graph.add_edge("general", "agent")
    graph.add_edge("travel_node", "agent")
    graph.add_edge("restaurant_node", "agent")
    graph.add_edge("places_node", "agent")
    graph.add_edge("news_node", "agent")
    graph.add_edge("youtube_node", "agent")
    

    # Train → agent
    graph.add_edge("train", "agent")
    graph.add_edge("web", "agent")
    graph.add_edge("job", "agent")
    graph.add_edge("youtube", "agent")
    graph.add_edge("sports", "agent")

    # Agent → Tool / END
    graph.add_conditional_edges(
        "agent",
        tools_condition,
        {
            "tools": "tools",
            END: END,
        }
    )

    # Tool → Agent
    graph.add_edge("tools", "agent")

    return graph.compile()