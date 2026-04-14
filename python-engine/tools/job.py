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
def smart_job_apply_assistant(job_link: str, phone: str):
    """
    ONE FUNCTION – REAL WORLD SAFE AGENT

    Input:
    - job_link: job/internship apply URL
    - phone: user phone number (+91...)

    Output:
    - Resume text
    - Cover letter text
    - WhatsApp notification
    """

    # STEP 1: Infer role from link (basic but effective)
    role = "Full Stack Developer"
    if "intern" in job_link.lower():
        role = "Full Stack Developer Intern"

    company = "Hiring Company"

    # STEP 2: Generate Resume
    resume = f"""
NAME: Ankit Tiwari
ROLE: {role}

SKILLS:
- React, Node.js, MongoDB
- Python, REST APIs
- Git, GitHub

PROJECTS:
- MERN Blog Application
- AI Chatbot with AI tools

EXPERIENCE:
- Fresher (Project based)

OBJECTIVE:
Seeking {role} opportunity to learn and contribute.
""".strip()

    # STEP 3: Generate Cover Letter
    cover_letter = f"""
Dear Hiring Manager,

I am applying for the {role} role.
I have built real-world projects using modern technologies
and I am eager to grow in a professional environment.

Regards,
Ankit Tiwari
""".strip()

    # STEP 4: WhatsApp Notification
    message = f"""
🎯 Job Apply Ready!

Role: {role}

✅ Resume generated
✅ Cover letter generated

👉 Apply here:
{job_link}

⚠️ Please submit the form manually.
"""

    client.messages.create(
        from_=os.getenv("TWILIO_WHATSAPP_FROM"),
        to=f"whatsapp:{phone}",
        body=message
    )

    # STEP 5: Return everything
    return {
        "status": "ready",
        "resume": resume,
        "cover_letter": cover_letter,
        "apply_link": job_link
    }




@tool()
def find_jobs_from_query(user_query: str) -> Dict:
    """
    Takes a user career-related query and returns real-time jobs/internships
    using RapidAPI JSearch (Google Jobs / LinkedIn sources).
    """

    url = "https://jsearch.p.rapidapi.com/search"

    headers = {
        "X-RapidAPI-Key": os.getenv("RAPID_API_KEY"),
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }

    params = {
        "query": user_query,
        "page": 1,
        "num_pages": 1,
        "employment_types": "FULLTIME,INTERN",
        "date_posted": "week"
    }

    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        return {
            "error": "Unable to fetch jobs",
            "status_code": response.status_code,
            "raw": response.text
        }

    data = response.json().get("data", [])

    results = []
    for job in data[:5]:
        results.append({
            "job_title": job.get("job_title"),
            "company": job.get("employer_name"),
            "location": job.get("job_city") or job.get("job_country"),
            "job_type": job.get("job_employment_type"),
            "apply_link": job.get("job_apply_link"),
            "source": job.get("job_publisher")
        })

    return {
        "query": user_query,
        "jobs_found": len(results),
        "results": results
    }