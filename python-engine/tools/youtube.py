import os
from urllib.parse import urlparse, parse_qs

from dotenv import load_dotenv
from langchain_core.tools import tool
from google import genai
from youtube_transcript_api import YouTubeTranscriptApi


# Load environment variables from .env
load_dotenv()


# --------------------------------------------------
# EXTRACT YOUTUBE VIDEO ID
# --------------------------------------------------

def extract_video_id(video_link: str):
    """Extract YouTube video ID from different YouTube URL formats."""

    try:
        parsed = urlparse(video_link)
        host = (parsed.hostname or "").lower()

        # https://www.youtube.com/watch?v=VIDEO_ID
        if host in ["youtube.com", "www.youtube.com"]:

            if parsed.path == "/watch":
                return parse_qs(parsed.query).get("v", [None])[0]

            # https://www.youtube.com/shorts/VIDEO_ID
            if parsed.path.startswith("/shorts/"):
                return parsed.path.split("/shorts/")[1].split("/")[0]

            # https://www.youtube.com/embed/VIDEO_ID
            if parsed.path.startswith("/embed/"):
                return parsed.path.split("/embed/")[1].split("/")[0]

        # https://youtu.be/VIDEO_ID
        if host in ["youtu.be", "www.youtu.be"]:
            return parsed.path.strip("/").split("/")[0]

        return None

    except Exception as e:
        print("❌ URL ERROR:", str(e))
        return None


# --------------------------------------------------
# YOUTUBE SUMMARIZER TOOL
# --------------------------------------------------

@tool()
def summarize_video(video_link: str):
    """
    Summarize a YouTube video using its available transcript.

    Supports Hindi and English transcripts and generates
    a structured summary using Gemini.
    """

    print("🎥 VIDEO LINK:", video_link)

    # ----------------------------------------------
    # Extract video ID
    # ----------------------------------------------

    video_id = extract_video_id(video_link)

    print("🎥 VIDEO ID:", video_id)

    if not video_id:
        return "❌ Invalid YouTube link."

    # ----------------------------------------------
    # Gemini API Key
    # ----------------------------------------------

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return "❌ GEMINI_API_KEY missing in .env"

    # ----------------------------------------------
    # Get YouTube Transcript
    # ----------------------------------------------

    try:

        print("📄 Fetching transcript...")

        ytt_api = YouTubeTranscriptApi()

        # Try Hindi first, then English
        transcript_data = ytt_api.fetch(
            video_id,
            languages=["hi", "en"]
        )

        # Convert transcript to plain text
        transcript = " ".join(
            snippet.text
            for snippet in transcript_data
        )

        if not transcript.strip():
            return "❌ Transcript is empty."

        print("✅ Transcript fetched successfully")
        print("📄 Transcript length:", len(transcript))

    except Exception as e:

        print("❌ TRANSCRIPT ERROR:", str(e))

        return (
            "❌ Transcript not available for this video. "
            "The video may not have captions available."
        )

    # ----------------------------------------------
    # Gemini Prompt
    # ----------------------------------------------

    prompt = f"""
You are an expert YouTube video summarization AI.

Analyze the complete YouTube transcript and create
an accurate, clear and useful summary.

Return the answer in EXACTLY this structure:

Summary:

Write 5-8 clear lines explaining the main content
of the video.

Key Concepts:

- Concept 1
- Concept 2
- Concept 3
- Concept 4
- Concept 5

Important Points:

- Point 1
- Point 2
- Point 3
- Point 4

Practical Takeaways:

- Takeaway 1
- Takeaway 2
- Takeaway 3

Difficulty Level:

Beginner / Intermediate / Advanced

One-Line Conclusion:

Write one sentence describing the main idea
of the video.

RULES:

- Do not invent information.
- Use only information present in the transcript.
- Ignore greetings and unnecessary filler.
- Ignore advertisements if present.
- Keep technical terms accurate.
- If programming concepts are discussed, explain
  them clearly.
- Keep the answer concise but useful.
- If the transcript is Hindi, understand the Hindi
  content and provide the final summary in English.

TRANSCRIPT:

{transcript}
"""

    # ----------------------------------------------
    # Gemini
    # ----------------------------------------------

    try:

        print("🤖 Sending transcript to Gemini...")

        gen_client = genai.Client(
            api_key=api_key
        )

        response = gen_client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt
        )

        if not response.text:
            return "❌ Gemini returned an empty response."

        print("✅ Summary generated successfully")

        return response.text

    except Exception as e:

        print("❌ GEMINI ERROR:", str(e))

        return f"❌ Gemini Error: {str(e)}"