import re

from langchain_core.messages import HumanMessage

from graph.state import State
from tools.places import search_places


def extract_rating_filter(query: str):
    """
    Extract rating filter from user query.

    Examples:
    'rating 4.5 or higher' -> 4.5
    'above 4.5 rating'     -> 4.5
    '4.5+ rated hotels'    -> 4.5
    """

    patterns = [
        r"rating\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:or higher|or above|\+)?",
        r"(?:above|over|greater than|more than)\s*(\d+(?:\.\d+)?)",
        r"(\d+(?:\.\d+)?)\s*\+\s*(?:rated|rating)?"
    ]

    for pattern in patterns:
        match = re.search(pattern, query, re.IGNORECASE)

        if match:
            return float(match.group(1))

    return None


def filter_places(data, min_rating=None):
    """
    Filter and sort places using rating.
    """

    # API response structure may vary
    if isinstance(data, dict):
        places = (
            data.get("places")
            or data.get("results")
            or data.get("data")
            or []
        )
    elif isinstance(data, list):
        places = data
    else:
        return data

    if not isinstance(places, list):
        return data

    filtered = []

    for place in places:

        if not isinstance(place, dict):
            continue

        rating = (
            place.get("rating")
            or place.get("ratingValue")
        )

        # If no rating filter was requested,
        # keep the place.
        if min_rating is None:
            filtered.append(place)
            continue

        try:
            rating = float(rating)

            if rating >= min_rating:
                filtered.append(place)

        except (TypeError, ValueError):
            # No valid rating -> don't include
            # when a rating filter is requested.
            continue

    # Highest rating first
    filtered.sort(
        key=lambda x: float(
            x.get("rating", 0) or 0
        ),
        reverse=True
    )

    return filtered


def places_node(state: State):

    print("📍 PLACES NODE RUNNING")

    query = state["query"]

    print("📝 USER QUERY:", query)

    # -----------------------------------
    # 1. Call Places API
    # -----------------------------------

    result = search_places.invoke({
        "query": query
    })

    print("📍 PLACES RESULT:", result)

    # -----------------------------------
    # 2. API Error
    # -----------------------------------

    if not result.get("success"):

        print("❌ PLACES API FAILED")

        return {
            "messages": state["messages"] + [
                HumanMessage(
                    content=(
                        "Sorry, I couldn't fetch places right now. "
                        "Please try again later."
                    )
                )
            ],
            "llm_result": str(result)
        }

    # -----------------------------------
    # 3. Get API Data
    # -----------------------------------

    data = result.get("data")

    if not data:

        print("❌ NO PLACES FOUND")

        return {
            "messages": state["messages"] + [
                HumanMessage(
                    content="I couldn't find any places for your query."
                )
            ],
            "llm_result": "No places found."
        }

    # -----------------------------------
    # 4. Extract rating filter
    # -----------------------------------

    min_rating = extract_rating_filter(query)

    print("⭐ MIN RATING:", min_rating)

    # -----------------------------------
    # 5. Filter places
    # -----------------------------------

    filtered_places = filter_places(
        data,
        min_rating
    )

    print("🔎 FILTERED PLACES:", filtered_places)

    # -----------------------------------
    # 6. If rating filter was requested
    #    but nothing matched
    # -----------------------------------

    if min_rating is not None and not filtered_places:

        return {
            "messages": state["messages"] + [
                HumanMessage(
                    content=(
                        f"I couldn't find any places with "
                        f"a rating of {min_rating} or higher."
                    )
                )
            ],
            "llm_result": "No matching places found."
        }

    # -----------------------------------
    # 7. Prompt for LLM
    # -----------------------------------

    prompt = f"""
The user asked:

{query}

REAL-TIME PLACES API RESULTS:

{filtered_places}

Answer the user's original question using ONLY
the information available in the API results above.

Include whenever available:

- Place name
- Rating
- Number of reviews
- Address
- Distance
- Price level
- Opening hours
- Maps/place link
- Other useful information present in the API

IMPORTANT RULES:

- Do NOT invent places.
- Do NOT invent ratings.
- Do NOT invent review counts.
- Do NOT invent addresses.
- Do NOT invent prices.
- Do NOT invent distances.
- Do NOT invent opening hours.
- Do NOT invent Maps links.
- Do NOT use your own knowledge.
- Use ONLY the API results.
- If information is missing, omit it.
- The results have already been filtered according
  to the user's rating requirement.
- Do not claim a place is nearby unless the API
  provides enough location/distance information.
- Keep the answer concise and useful.
- If multiple places are available, use a numbered list.
"""

    # -----------------------------------
    # 8. Return to LLM
    # -----------------------------------

    print("🤖 SENDING FILTERED PLACES TO LLM")

    return {
        "messages": state["messages"] + [
            HumanMessage(content=prompt)
        ],
        "llm_result": str(filtered_places)
    }