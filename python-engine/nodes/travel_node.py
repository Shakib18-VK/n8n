
import re
from datetime import datetime, timedelta

from langchain_core.messages import HumanMessage

from graph.state import State

from tools.flight import search_flight_price_insights
from tools.hotel import search_hotels
from tools.weather import get_weather


def travel_node(state: State):

    query = state["query"]

    print("✈️ TRAVEL NODE RUNNING")
    print("📝 QUERY:", query)

    # -----------------------------------------
    # 1. Extract source and destination
    # -----------------------------------------

    match = re.search(
        r"\bfrom\s+(.+?)\s+to\s+(.+?)(?:\s+on|\s+for|\s+from|$)",
        query,
        re.IGNORECASE
    )

    if not match:

        message = (
            "Please provide your source and destination. "
            "Example: I want to travel from Delhi to Paris."
        )

        return {
            "messages": state["messages"] + [
                HumanMessage(content=message)
            ],
            "llm_result": message
        }

    origin = match.group(1).strip()
    destination = match.group(2).strip()

    print("🛫 ORIGIN:", origin)
    print("🛬 DESTINATION:", destination)

    # -----------------------------------------
    # 2. Default travel dates
    # -----------------------------------------

    check_in = (
        datetime.now() + timedelta(days=14)
    ).strftime("%Y-%m-%d")

    check_out = (
        datetime.now() + timedelta(days=17)
    ).strftime("%Y-%m-%d")

    print("📅 CHECK-IN:", check_in)
    print("📅 CHECK-OUT:", check_out)

    # -----------------------------------------
    # 3. FLIGHT API
    # -----------------------------------------

    try:

        flight_result = search_flight_price_insights.invoke({
            "origin": origin,
            "destination": destination,
            "date": check_in
        })

    except Exception as e:

        flight_result = {
            "error": f"Flight search failed: {str(e)}"
        }

    print("✈️ FLIGHT RESULT:", flight_result)

    # -----------------------------------------
    # 4. HOTEL API
    # -----------------------------------------

    try:

        hotel_result = search_hotels.invoke({
            "location": destination,
            "check_in": check_in,
            "check_out": check_out
        })

    except Exception as e:

        hotel_result = {
            "error": f"Hotel search failed: {str(e)}"
        }

    print("🏨 HOTEL RESULT:", hotel_result)

    # -----------------------------------------
    # 5. WEATHER API
    # -----------------------------------------

    coordinates = {

        "delhi": (28.6139, 77.2090),

        "mumbai": (19.0760, 72.8777),

        "bangalore": (12.9716, 77.5946),

        "bengaluru": (12.9716, 77.5946),

        "kolkata": (22.5726, 88.3639),

        "chennai": (13.0827, 80.2707),

        "paris": (48.8566, 2.3522),

        "london": (51.5074, -0.1278),

        "new york": (40.7128, -74.0060),

        "dubai": (25.2048, 55.2708)
    }

    destination_key = destination.lower().strip()

    weather_result = {
        "error": "Coordinates not available for this destination."
    }

    if destination_key in coordinates:

        latitude, longitude = coordinates[destination_key]

        print("📍 LATITUDE:", latitude)
        print("📍 LONGITUDE:", longitude)

        try:

            weather_result = get_weather.invoke({
                "latitude": latitude,
                "longitude": longitude,
                "lang": "EN"
            })

        except Exception as e:

            weather_result = {
                "error": f"Weather search failed: {str(e)}"
            }

    print("🌤️ WEATHER RESULT:", weather_result)

    # -----------------------------------------
    # 6. Combine all results
    # -----------------------------------------

    combined_result = f"""
TRAVEL REQUEST:
{query}

SOURCE:
{origin}

DESTINATION:
{destination}

TRAVEL DATE:
{check_in}

RETURN DATE:
{check_out}


✈️ FLIGHT DATA:
{flight_result}


🏨 HOTEL DATA:
{hotel_result}


🌤️ WEATHER DATA:
{weather_result}
"""

    print("📦 COMBINED RESULT:")
    print(combined_result)

    # -----------------------------------------
    # 7. Send results to Gemini / Agent
    # -----------------------------------------

    message = f"""
You are a Travel Planning Assistant.

The user asked:

{query}

Here are the real API results:

{combined_result}

Create a useful travel plan for the user.

IMPORTANT RULES:

1. Use ONLY the information provided by the APIs.
2. Do NOT invent flight prices.
3. Do NOT invent hotel prices.
4. Do NOT invent weather information.
5. If some information is unavailable, clearly say so.
6. Do NOT change the source or destination.
7. Keep the answer concise and useful.
8. Organize the answer into:

   1. Flights
   2. Hotels
   3. Weather
   4. Recommendation
"""

    # -----------------------------------------
    # 8. Return result to Agent
    # -----------------------------------------

    return {

        "messages": state["messages"] + [
            HumanMessage(content=message)
        ],

        "llm_result": combined_result
    }

