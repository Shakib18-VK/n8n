# flake8: noqa
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from typing import Annotated, Dict, List, Any, Optional
from langgraph.graph.message import add_messages
from langchain_google_genai import ChatGoogleGenerativeAI
from google import genai
import os
from dotenv import load_dotenv
import requests
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode, tools_condition
from serpapi.google_search import GoogleSearch
import smtplib
from email.message import EmailMessage
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi
from twilio.rest import Client
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.runnables import RunnableConfig # <-- Very Important

load_dotenv()

# --- INITIALIZE CONSTANTS ---
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM")
RAPID_API_KEY = os.getenv("RAPID_API_KEY")
SERPAPI_KEY = os.getenv("SERPAPI_KEY")
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

twilio_client = Client(TWILIO_SID, TWILIO_TOKEN)

client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
)


@tool()
def summarize_video(video_link: str, config: RunnableConfig):
    """
    Takes a YouTube video link and returns:
    - Summary
    - Key Concepts
    - Important Takeaways
    """

    # 1. Extract video ID
    query = parse_qs(urlparse(video_link).query)
    video_id = query.get("v", [None])[0]

    if not video_id:
        return "❌ Invalid YouTube link"

    # 2. Get API key from LangGraph config (NOT env)
    api_key = config.get("configurable", {}).get("api_key")
    if not api_key:
        return "❌ Gemini API key missing"

    # 3. Fetch transcript
    try:
        transcript_data = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = " ".join([item["text"] for item in transcript_data])
    except Exception:
        return "❌ Transcript not available for this video"

    # 4. Structured prompt (from second code)
    prompt = f"""
You are an expert content analyst.

TASK:
- Ignore ads, greetings, filler words
- Extract ONLY useful information

Return STRICTLY in this format:

Summary:
(5–6 lines max)

Key Concepts:
- concept 1
- concept 2
- concept 3

Important Takeaways:
- takeaway 1
- takeaway 2

Transcript:
{transcript}
"""

    # 5. Gemini call (same style as first code)
    try:
        gen_client = genai.Client(api_key=api_key)
        res = gen_client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        return res.text
    except Exception as e:
        return f"❌ Gemini Error: {str(e)}"
