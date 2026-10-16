from langchain_core.messages import HumanMessage

from graph.state import State
from tools.youtubes import search_youtube


def youtube_node(state: State):

    print("🎥 YOUTUBE NODE RUNNING")

    query = state["query"]

    print("📝 USER QUERY:", query)

    result = search_youtube.invoke({
        "query": query
    })

    print("🎥 YOUTUBE RESULT:", result)

    # API ERROR
    if not result.get("success"):
        return {
            "messages": state["messages"] + [
                HumanMessage(
                    content="Sorry, I couldn't fetch YouTube videos right now."
                )
            ],
            "llm_result": [],
            "route": "youtube_node"
        }

    data = result.get("data")

    if not data:
        return {
            "messages": state["messages"] + [
                HumanMessage(
                    content="I couldn't find any YouTube videos."
                )
            ],
            "llm_result": [],
            "route": "youtube_node"
        }

    # Extract contents
    contents = data.get("contents", [])

    videos = []

    for item in contents:

        if item.get("type") != "video":
            continue

        video = item.get("video", {})

        if not video:
            continue

        # Thumbnail
        thumbnails = video.get("thumbnails", [])

        thumbnail = None

        if thumbnails:
            thumbnail = thumbnails[-1].get("url")

        # Author
        author = video.get("author", {})

        channel_name = author.get("title")

        # Clean video object
        videos.append({
            "title": video.get("title"),
            "videoId": video.get("videoId"),
            "channel": channel_name,
            "description": video.get("descriptionSnippet"),
            "duration": video.get("lengthSeconds"),
            "published": video.get("publishedTimeText"),
            "views": video.get("stats", {}).get("views"),
            "thumbnail": thumbnail,
            "isLive": video.get("isLiveNow", False)
        })

    print("🎥 CLEAN VIDEOS:", videos)

    if not videos:
        return {
            "messages": state["messages"] + [
                HumanMessage(
                    content="I couldn't find any YouTube videos for your query."
                )
            ],
            "llm_result": [],
            "route": "youtube_node"
        }

    # Keep first 10 videos
    videos = videos[:10]

    prompt = f"""
The user asked:

{query}

REAL-TIME YOUTUBE SEARCH RESULTS:

{videos}

Create a concise and useful response based ONLY on these YouTube results.

For each relevant video include:

- Title
- Channel
- Views
- Published time
- Duration
- Short description

Rules:

- Do not invent information.
- Do not invent views.
- Do not invent channel names.
- Do not invent dates.
- Do not invent descriptions.
- Do not add information that is not present in the API results.
- Prefer the most relevant videos.
- Keep the response concise.

The frontend will display the videos as cards.
"""

    return {
        "messages": state["messages"] + [
            HumanMessage(content=prompt)
        ],

        # IMPORTANT:
        # Keep structured data instead of converting to string.
        "llm_result": videos,

        "route": "youtube_node"
    }