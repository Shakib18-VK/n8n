import re

from langchain_core.messages import HumanMessage

from graph.state import State
from tools.restaurant import search_restaurants


def extract_city(query: str):
    patterns = [
        r"\bin\s+([A-Za-z\s]+?)(?:\s+under|\s+with|\s+near|[,.!?]|$)",
        r"\bat\s+([A-Za-z\s]+?)(?:\s+under|\s+with|\s+near|[,.!?]|$)",
        r"\bnear\s+([A-Za-z\s]+?)(?:\s+under|\s+with|[,.!?]|$)"
    ]

    for pattern in patterns:
        match = re.search(pattern, query, re.IGNORECASE)

        if match:
            return match.group(1).strip()

    return None


def restaurant_node(state: State):

    print("🍽️ RESTAURANT NODE RUNNING")

    query = state["query"]

    print("📝 USER QUERY:", query)

    # --------------------------------
    # 1. Extract city
    # --------------------------------

    city = extract_city(query)

    if not city:

        return {
            "messages": state["messages"] + [
                HumanMessage(
                    content=(
                        "Please provide the city where you "
                        "want to find restaurants."
                    )
                )
            ],
            "llm_result": "City is required."
        }

    print("📍 CITY:", city)

    # --------------------------------
    # 2. Search restaurants
    # --------------------------------

    restaurant_query = f"restaurants in {city}"

    print("🔎 RESTAURANT QUERY:", restaurant_query)

    restaurant_result = search_restaurants.invoke({
        "query": restaurant_query
    })

    print("🍽️ RESTAURANT RESULT:", restaurant_result)

    # --------------------------------
    # 3. Check API response
    # --------------------------------

    if not restaurant_result.get("success"):

        print("❌ RESTAURANT API FAILED")

        return {
            "messages": state["messages"] + [
                HumanMessage(
                    content=(
                        f"Sorry, I couldn't fetch restaurant "
                        f"results for {city} right now."
                    )
                )
            ],
            "llm_result": str(restaurant_result)
        }

    restaurant_data = restaurant_result.get("data", {})

    # --------------------------------
    # 4. Validate restaurant data
    # --------------------------------

    if not restaurant_data:

        print("❌ EMPTY RESTAURANT DATA")

        return {
            "messages": state["messages"] + [
                HumanMessage(
                    content=(
                        f"I couldn't find any restaurant "
                        f"data for {city}."
                    )
                )
            ],
            "llm_result": str(restaurant_result)
        }

    # --------------------------------
    # 5. Send real API data to LLM
    # --------------------------------

    llm_prompt = f"""
The user asked:

{query}

City:

{city}

REAL-TIME RESTAURANT API RESULTS:

{restaurant_data}

Answer the user's original question using ONLY
the restaurant API results above.

IMPORTANT RULES:

- Do NOT use your own knowledge.
- Do NOT invent restaurants.
- Do NOT invent ratings.
- Do NOT invent prices.
- Do NOT invent distance.
- Do NOT invent restaurant details.
- Only mention information present in the API results.
- If a requested field is missing, say that it is unavailable.
- Apply the user's rating filter ONLY if rating data exists.
- Apply the user's price/budget filter ONLY if price data exists.
- Do NOT assume that a restaurant is under ₹500
  unless the API provides sufficient price information.
- If exact ₹500 pricing is unavailable, clearly say
  that exact budget confirmation is unavailable.
- Recommend the most relevant restaurants based
  only on the API results.
"""

    return {
        "messages": state["messages"] + [
            HumanMessage(
                content=llm_prompt
            )
        ],
        "llm_result": str(restaurant_data)
    }