import os
import requests

from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()

HOST = "google-search-master-mega.p.rapidapi.com"
URL = f"https://{HOST}/places"


@tool
def search_places(query: str):
    """
    Search for places using Google Search Master MEGA Places API.
    Example:
    search_places("restaurants in Bhopal")
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
        "q": query
    }

    try:
        response = requests.get(
            URL,
            headers=headers,
            params=params,
            timeout=30
        )

        print("📍 PLACES STATUS:", response.status_code)
        print("📍 PLACES RESPONSE:", response.text)

        if response.status_code != 200:
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }

        return {
            "success": True,
            "data": response.json()
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