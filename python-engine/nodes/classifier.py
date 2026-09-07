import os
from dotenv import load_dotenv
from google import genai
from graph.state import State

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def classification_query(state: State) -> State:
    print("🧭 classifier node running")

    query = state["query"]

    SYSTEM_PROMPT = """
You are a query classification AI.

Your task:
Classify the user query into EXACTLY ONE of the following categories:

- is_coding_question
- is_doctor_question
- is_farmer_question
- is_advice_question
- is_general_question
- get_live_train_status -> Get the real-time running status of an Indian train using its train number.
- realtime_web_search -> You are a real-time web search tool. Your job is to search the internet and return the most relevant and up-to-date Search the web whenever the user asks for current, latest, recent, real-time Return the relevant web search results and information in a clean format that another AI agent can use to generate the final answer.
- find_jobs_from_query -> You are a find_jobs_from_query Search Agent. Your job is to provide accurate and up-to-date information by searching the internet whenever the user's query requires current or recently changed information.Use the web search tool when the user asks about latest newscurrent events today's information Your final response must directly answer the user's original question.
- summarize_video -> You are an expert YouTube video summarization and content analysis AI. Your task is to analyze the provided YouTube transcript and create a clear,
accurate, and useful summary.
- travel_node -> You are a helpful travel assistant. Your job is to understand the user's travel-related query and provide
useful, practical information.
- get_live_cricket_score-> Get live cricket match information. Use this tool when the user asks about: Returns live cricket match data from the Cricbuzz API.
- get_weather -> Get current and 5-day weather forecast for a location.

  Use for:
  - weather
  - temperature
  - rain
  - humidity
  - wind
  - forecast
  - today's/tomorrow's weather

  Examples:
  - What's the weather in Bhopal?
  - Will it rain tomorrow?
  - What's the temperature in Delhi?
  - Give me the 5-day forecast.

  
Rules:
- Respond with ONLY ONE category name
- No explanations
- No extra text
- No punctuation
- Lowercase only
Note ---> "You must return your final answer strictly as a plain text string. Never wrap the response in a JSON object or use keys like type, text, or extras. Output only raw text."

"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=[
            {"role": "user", "parts": [{"text": SYSTEM_PROMPT}]},
            {"role": "user", "parts": [{"text": query}]},
        ],
    )

    route = response.text.strip()

    print("➡️ classified as:", route)

    state["route"] = route
    return state


def route(state: State) -> str:
    return state["route"]
