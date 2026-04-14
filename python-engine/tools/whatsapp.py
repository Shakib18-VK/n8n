from langchain_core.tools import tool
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
def send_whatsapp_notification(phone: str, event: str, extra_data: dict | None = None):
    """
    Sends WhatsApp notification using Twilio
    """

    phone = phone.replace("whatsapp:", "").strip()

    if extra_data and not isinstance(extra_data, dict):
        extra_data = {"info": str(extra_data)}

    messages = {
        "job_match": "🎯 Good news!\nA new job or internship matches your profile 🚀",
        "interview": "⏰ Interview Reminder!\nYour interview is coming up 💼",
        "train_alert": "🚆 Train Update!\nYour train is delayed.",
        "custom": "🔔 You have a new notification."
    }

    message_body = messages.get(event, messages["custom"])

    if extra_data:
        message_body += "\n\n📌 Details:"
        for k, v in extra_data.items():
            message_body += f"\n• {k}: {v}"

    try:
        message = client.messages.create(
            from_=os.getenv("TWILIO_WHATSAPP_FROM"),
            to=f"whatsapp:{phone}",
            body=message_body
        )

        return {
            "success": True,
            "sid": message.sid
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
