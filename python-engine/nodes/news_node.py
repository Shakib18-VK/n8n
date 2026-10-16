from langchain_core.messages import HumanMessage

from graph.state import State
from tools.news import search_news


def news_node(state: State):

    print("📰 NEWS NODE RUNNING")

    query = state["query"]

    print("📝 USER QUERY:", query)

    result = search_news.invoke({
        "query": query
    })

    print("📰 NEWS RESULT:", result)

    # API ERROR
    if not result.get("success"):

        return {
            "messages": state["messages"] + [
                HumanMessage(
                    content="Sorry, I couldn't fetch the latest news right now."
                )
            ],
            "llm_result": str(result)
        }

    data = result.get("data")

    if not data:

        return {
            "messages": state["messages"] + [
                HumanMessage(
                    content="I couldn't find any news for your query."
                )
            ],
            "llm_result": "No news found."
        }

    # Extract news list
    news = data.get("news", [])

    if not news:

        return {
            "messages": state["messages"] + [
                HumanMessage(
                    content="I couldn't find any news for your query."
                )
            ],
            "llm_result": "No news found."
        }

    prompt = f"""
The user asked:

{query}

REAL-TIME NEWS API RESULTS:

{news}

Answer the user's question using ONLY the news API results.

For each relevant news article, include whenever available:

- Title
- Source
- Date
- Short summary
- Link

Rules:
- Do not invent news.
- Do not invent dates.
- Do not invent sources.
- Do not invent links.
- Do not add information that is not present in the API results.
- If information is missing, simply omit it.
- Prefer the most relevant and recent articles.
- Keep the answer clear and concise.
"""

    return {
        "messages": state["messages"] + [
            HumanMessage(content=prompt)
        ],
        "llm_result": str(news)
    }