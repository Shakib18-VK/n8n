import os
import requests

from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()

HOST = "google-search-master-mega.p.rapidapi.com"
URL = f"https://{HOST}/news"


@tool
def search_news(query: str):
    """
    Search latest news using Google Search Master MEGA News API.

    Example:
    search_news("AI latest news")
    """

    api_key = os.getenv("RAPID_API_KEY")

    if not api_key:
        return {
            "success": False,
            "error": "RAPID_API_KEY is missing in .env"
        }

    headers = {
        "Content-Type": "application/json",
        "x-rapidapi-host": HOST,
        "x-rapidapi-key": api_key
    }

    params = {
        "q": query,
        "gl": "in",
        "hl": "en",
        "autocorrect": "true",
        "num": 10,
        "page": 1
    }

    try:
        response = requests.get(
            URL,
            headers=headers,
            params=params,
            timeout=30
        )

        print("📰 NEWS STATUS:", response.status_code)
        print("📰 NEWS RESPONSE:", response.text)

        if response.status_code != 200:
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }

        data = response.json()

        return {
            "success": True,
            "data": data
        }

    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": str(e)
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }