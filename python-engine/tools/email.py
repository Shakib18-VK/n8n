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
def send_email(user_email: str, subject: str, message: str) -> str:
    """
    Sends an email using Gmail SMTP.
    Requires:
      EMAIL_USER & EMAIL_PASS in environment variables.
    """

    if not user_email or not subject or not message:
        return "❌ Email, subject, or message is missing."

    EMAIL_USER = os.getenv("EMAIL_USER")
    EMAIL_PASS = os.getenv("EMAIL_PASS")

    if not EMAIL_USER or not EMAIL_PASS:
        return "❌ Email credentials not set in environment variables."

    try:
        msg = EmailMessage()
        msg["From"] = EMAIL_USER
        msg["To"] = user_email
        msg["Subject"] = subject
        msg.set_content(message)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)

        return "✅ Email sent successfully."

    except Exception as e:
        return f"❌ Failed to send email: {str(e)}"