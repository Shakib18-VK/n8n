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
    Find real-time jobs and internships using RapidAPI JSearch.

    Input:
        Natural language career query from the user.

    Output:
        Up to 5 relevant jobs with title, company, location,
        job type, application link and source.
    """

    if not user_query or not isinstance(user_query, str):
        return {
            "error": "Job search query is missing or invalid."
        }

    api_key = os.getenv("RAPID_API_KEY")

    if not api_key:
        return {
            "error": "RAPID_API_KEY is not set in environment variables."
        }

    url = "https://jsearch.p.rapidapi.com/search"

    headers = {
        "X-RapidAPI-Key": api_key,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }

    # Convert natural-language query into a cleaner job query
    query = user_query.lower()

    if "full stack" in query:
        search_query = "Full Stack Developer"
    elif "frontend" in query or "front end" in query:
        search_query = "Frontend Developer"
    elif "backend" in query or "back end" in query:
        search_query = "Backend Developer"
    elif "react" in query:
        search_query = "React Developer"
    elif "node" in query or "node.js" in query:
        search_query = "Node.js Developer"
    elif "python" in query:
        search_query = "Python Developer"
    elif "java" in query:
        search_query = "Java Developer"
    else:
        search_query = user_query

    params = {
        "query": search_query,
        "page": 1,
        "num_pages": 1,
        "date_posted": "month"
    }

    try:

        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=1545
        )

        print("💼 JSEARCH STATUS:", response.status_code)
        print("💼 SEARCH QUERY:", search_query)

        if response.status_code != 200:
            print("❌ JSEARCH ERROR:", response.text)

            return {
                "error": "Unable to fetch jobs",
                "status_code": response.status_code,
                "raw": response.text
            }

        response_data = response.json()

        data = response_data.get("data", [])

        results = []

        for job in data[:5]:

            results.append({
                "job_title": job.get("job_title"),
                "company": job.get("employer_name"),
                "location": (
                    job.get("job_city")
                    or job.get("job_state")
                    or job.get("job_country")
                    or "Not specified"
                ),
                "job_type": job.get("job_employment_type"),
                "apply_link": job.get("job_apply_link"),
                "source": job.get("job_publisher")
            })

        if not results:
            return {
                "query": search_query,
                "jobs_found": 0,
                "results": [],
                "message": "No jobs found for this search query."
            }

        return {
            "query": search_query,
            "jobs_found": len(results),
            "results": results
        }

    except requests.exceptions.Timeout:

        return {
            "error": "Job search request timed out."
        }

    except requests.exceptions.RequestException as e:

        return {
            "error": f"Job search request failed: {str(e)}"
        }

    except Exception as e:

        return {
            "error": f"Unexpected error: {str(e)}"
        }